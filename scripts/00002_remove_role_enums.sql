BEGIN;

-- Converts role-related enum columns to text so role fields can accept any value.
-- Safe to run even if there are no role enum types in the database.
DO $$
DECLARE
  enum_type RECORD;
  enum_column RECORD;
  default_expr text;
  converted_default text;
  remaining_columns integer;
BEGIN
  FOR enum_type IN
    SELECT n.nspname AS schema_name, t.typname AS type_name
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typtype = 'e'
      AND t.typname ILIKE '%role%'
  LOOP
    FOR enum_column IN
      SELECT c.table_schema, c.table_name, c.column_name
      FROM information_schema.columns c
      WHERE c.udt_schema = enum_type.schema_name
        AND c.udt_name = enum_type.type_name
    LOOP
      SELECT pg_get_expr(ad.adbin, ad.adrelid)
      INTO default_expr
      FROM pg_attrdef ad
      JOIN pg_attribute a
        ON a.attrelid = ad.adrelid
       AND a.attnum = ad.adnum
      JOIN pg_class cls
        ON cls.oid = ad.adrelid
      JOIN pg_namespace ns
        ON ns.oid = cls.relnamespace
      WHERE ns.nspname = enum_column.table_schema
        AND cls.relname = enum_column.table_name
        AND a.attname = enum_column.column_name;

      IF default_expr IS NOT NULL THEN
        EXECUTE format(
          'ALTER TABLE %I.%I ALTER COLUMN %I DROP DEFAULT',
          enum_column.table_schema,
          enum_column.table_name,
          enum_column.column_name
        );
      END IF;

      EXECUTE format(
        'ALTER TABLE %I.%I ALTER COLUMN %I TYPE text USING %I::text',
        enum_column.table_schema,
        enum_column.table_name,
        enum_column.column_name,
        enum_column.column_name
      );

      IF default_expr IS NOT NULL THEN
        converted_default := default_expr;
        converted_default := replace(
          converted_default,
          format('::%I.%I', enum_type.schema_name, enum_type.type_name),
          '::text'
        );
        converted_default := replace(
          converted_default,
          format('::%I', enum_type.type_name),
          '::text'
        );

        EXECUTE format(
          'ALTER TABLE %I.%I ALTER COLUMN %I SET DEFAULT %s',
          enum_column.table_schema,
          enum_column.table_name,
          enum_column.column_name,
          converted_default
        );
      END IF;
    END LOOP;

    SELECT count(*)
    INTO remaining_columns
    FROM information_schema.columns c
    WHERE c.udt_schema = enum_type.schema_name
      AND c.udt_name = enum_type.type_name;

    IF remaining_columns = 0 THEN
      BEGIN
        EXECUTE format('DROP TYPE %I.%I', enum_type.schema_name, enum_type.type_name);
      EXCEPTION
        WHEN dependent_objects_still_exist THEN
          RAISE NOTICE 'Type %.% still has non-column dependencies, skipping drop.',
            enum_type.schema_name, enum_type.type_name;
      END;
    END IF;
  END LOOP;
END
$$;

COMMIT;