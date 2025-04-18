const siteKey = process.env.REACT_APP_CAPTCHA_SITE_KEY;

// Ensure script is loaded only once
let recaptchaScriptLoaded = false;

export const loadRecaptcha = () => {
  if (recaptchaScriptLoaded || typeof window === 'undefined') return;

  const script = document.createElement('script');
  script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
  script.async = true;
  script.defer = true;

  script.onload = () => {
    recaptchaScriptLoaded = true;
  };

  document.body.appendChild(script);
};

export const getRecaptchaToken = async (action = 'default') => {
  if (!window.grecaptcha || !siteKey) {
    throw new Error('reCAPTCHA not loaded or site key missing');
  }
  return await window.grecaptcha.execute(siteKey, { action });
};
