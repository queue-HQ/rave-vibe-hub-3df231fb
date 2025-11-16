import { userStatus } from "@/api/auth";
import logo from "@/assets/logo.png";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const WaitingApproval = () => {
  const [status, setStatus] = useState(null);
  const [pageLoader, setPageLoader] = useState(true);
  const userRegister = JSON.parse(localStorage.getItem("user-register"));
  const navigate = useNavigate();
  const { state } = useLocation();
  const formData = state?.formData;

  console.log("FORM DATA IN WAITING APPROVAL:", formData);

  useEffect(() => {
    const interval = setInterval(() => {
      checkStatus();
    }, 5000); // 600000 seconds

    async function checkStatus() {
      try {
        const res = await userStatus(userRegister.username);
        setStatus(res.status);
        if (res.status === "approved") {
          localStorage.removeItem("user-register");
          localStorage.setItem("user-verify", JSON.stringify(true));
          navigate("/verify-otp");
        }
        console.log("STATUS:", res);
      } catch (err) {
        console.log("Error getting status:", err);
      }
    }

    checkStatus(); // first call immediately

    return () => clearInterval(interval); // cleanup
  }, []);

  useEffect(() => {
    if (userRegister === null) {
      setTimeout(() => {
        navigate("/signup");
      }, 500);
      return;
    }

    setPageLoader(false);
  }, []);

  return (
    <>
      {pageLoader ? (
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-14 w-14 animate-spin text-primary" />
        </div>
      ) : (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_hsl(330_81%_60%_/_0.2)_0%,_transparent_50%)] animate-pulse-neon" />
          <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,_transparent_0deg,_hsl(330_81%_60%_/_0.1)_60deg,_transparent_120deg)] opacity-30" />

          <div className="w-full max-w-md relative z-10">
            <div className="gradient-card neon-border rounded-2xl p-8 backdrop-blur-xl shadow-[0_0_50px_hsl(330_81%_60%_/_0.3)]">
              <div className="flex justify-center mb-8">
                <img src={logo} alt="QHQ Logo" className="h-20 animate-float" />
              </div>

              <h1 className="text-3xl font-bold text-center mb-2">
                Waiting for Approval
              </h1>
              <p className="text-muted-foreground text-center mt-4">
                Your registration is complete.
              </p>
              <p className="text-muted-foreground text-center mb-8">
                Please wait while the admin reviews and approves your account.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WaitingApproval;
