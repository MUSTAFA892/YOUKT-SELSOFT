import { PlagiarismDetectionService } from '../src/plagiarism/plagiarism-detection.service';

const service = new PlagiarismDetectionService();

const copilotCode = `
function twoSum(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        map.set(nums[i], i);
    }
}
`;

// Problem ID '1' is Two Sum
const report = service.checkPlagiarism(copilotCode, 'candidate_123', 'interview_456', '1', 'sub_123');

console.log('--- AI Detection Test Result ---');
console.log('Overall Similarity:', report.overallSimilarity + '%');
console.log('Risk Level:', report.riskLevel);
console.log('Matches:', report.matches.length);

if (report.riskLevel === 'critical' && report.overallSimilarity >= 90) {
    console.log('SUCCESS: AI-generated code successfully detected!');
} else {
    console.log('FAILURE: AI-generated code was not correctly flagged.');
}
