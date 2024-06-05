// Replace authorizationKey with your client-side SDK key.
const config = {
    core: {
        //authorizationKey: process.env.REACT_APP_SPLIT_IO_AUTH_KEY,
        //key: process.env.REACT_APP_SPLIT_IO_KEY
        authorizationKey: "null",
        key: "null"
    }
};

export default config;

// Replace the following with the name of your feature flags
export const ff_back_button = 'Back_Button_In_App';
// Other treatments as you add them