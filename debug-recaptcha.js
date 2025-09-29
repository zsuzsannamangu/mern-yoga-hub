/**
 * Debug reCAPTCHA bypass logic
 */

const recaptchaToken = 'bypass';

console.log('reCAPTCHA token received:', recaptchaToken);
console.log('Token is bypass?', recaptchaToken === 'bypass');
console.log('Token exists?', !!recaptchaToken);
console.log('Should skip verification?', !recaptchaToken || recaptchaToken === 'bypass');

if (recaptchaToken && recaptchaToken !== 'bypass') {
    console.log('This should NOT run for bypass token');
} else {
    console.log('This SHOULD run for bypass token - verification skipped');
}
