import { SplashScreen } from "./SplashScreen.js";
import { LoadingScreen } from "./LoadingScreen.js";
import { OnboardingScreen } from "./OnboardingScreen.js";
import { LoginScreen } from "./LoginScreen.js";
/**
 * Team Alpha — the launch experience (splash → loading → onboarding/login → home). Registered as one
 * map so the runtime picks up all four screens without any change to the runtime itself.
 */
export const launchScreens = {
    splash: SplashScreen,
    loading: LoadingScreen,
    onboarding: OnboardingScreen,
    login: LoginScreen,
};
//# sourceMappingURL=registry.js.map