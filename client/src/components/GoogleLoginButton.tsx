import React, { useEffect, useRef } from "react";
import { toast } from "sonner";
import api from "@/services/api";

interface GoogleLoginButtonProps {
  onSuccess: (token: string, user: any) => void;
  text?: "signin_with" | "signup_with" | "continue_with" | "signup" | "signin";
  width?: string;
}

export const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({
  onSuccess,
  text = "signin_with",
  width = "384"
}) => {
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let intervalId: any = null;

    const initializeGoogleSignIn = () => {
      const google = (window as any).google;
      if (!google || !google.accounts || !google.accounts.id) {
        return false;
      }

      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      if (!clientId) {
        console.error("VITE_GOOGLE_CLIENT_ID is not configured in environment variables.");
        toast.error("Google Sign-In configuration error.");
        return true; // Stop checking, configuration is missing
      }

      try {
        google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response: any) => {
            try {
              toast.loading("Authenticating with Google...", { id: "google-auth" });
              const res = await api.post("/auth/google", { token: response.credential });
              const { token, data } = res.data;
              
              toast.success("Successfully logged in with Google!", { id: "google-auth" });
              onSuccess(token, data.user);
            } catch (error: any) {
              const errMsg = error.response?.data?.message || "Google Authentication failed.";
              toast.error(errMsg, { id: "google-auth" });
            }
          },
        });

        if (buttonRef.current) {
          google.accounts.id.renderButton(buttonRef.current, {
            theme: "outline",
            size: "large",
            width: width,
            text: text,
            shape: "rectangular",
            logo_alignment: "left",
          });
        }
        return true;
      } catch (err) {
        console.error("Failed to initialize Google Sign-In:", err);
        return false;
      }
    };

    // Try initializing immediately
    const initialized = initializeGoogleSignIn();
    
    // If not initialized, poll until the script is fully loaded
    if (!initialized) {
      intervalId = setInterval(() => {
        const done = initializeGoogleSignIn();
        if (done) {
          clearInterval(intervalId);
        }
      }, 100);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [onSuccess, text, width]);

  return (
    <div className="w-full flex justify-center py-1">
      <div ref={buttonRef} id="googleSignInButton" className="w-full max-w-[384px]"></div>
    </div>
  );
};
