let toastCallback = null;

export const setToastCallback = (callback) => {
  toastCallback = callback;
};

export const showToast = (message, type = 'info') => {
  if (toastCallback) {
    toastCallback(message, type);
  }
};
