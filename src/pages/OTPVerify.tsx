import { useState, useRef, useEffect } from "react";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { registerUserOTP } from "@/api/auth";
import { Loader2 } from "lucide-react";

const OTPVerify = () => {
  const [loading, setLoading] = useState(false);
  const [pageLoader, setPageLoader] = useState(true);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputsRef = useRef<HTMLInputElement[]>([]);
  const userPaylod = JSON.parse(localStorage.getItem("user-register-payload"));
  const userVerify = localStorage.getItem("user-verify");
  const navigate = useNavigate();

  useEffect(() => {
    if (!userVerify) {
      setTimeout(() => {
        navigate("/signup");
      }, 500);
      return;
    }

    setPageLoader(false);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const value = e.target.value.replace(/\D/g, ""); // only numbers
    const newOtp = [...otp];

    if (value) {
      newOtp[index] = value[0]; // first digit only
      setOtp(newOtp);
      if (index < 5) inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace") {
      const newOtp = [...otp];
      if (otp[index]) {
        newOtp[index] = ""; // delete current
      } else if (index > 0) {
        newOtp[index - 1] = ""; // delete previous
        inputsRef.current[index - 1]?.focus();
      }
      setOtp(newOtp);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    const otpCode = otp.join("");
    let formData = {
      email: userPaylod.email,
      otp: otpCode,
    };

    try {
      const res = await registerUserOTP(formData);

      if (res.success) {
        localStorage.removeItem("user-verify");
        localStorage.setItem("user-setup-profile", JSON.stringify(true));
        navigate("/setup-profile");
        toast.success("OTP verify successfully!");
        setLoading(false);
      } else {
        toast.error("Session expired!");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  const isOtpComplete = otp.every((digit) => digit !== ""); // check 6 digits filled

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
                Verify OTP
              </h1>
              <p className="text-muted-foreground text-center mt-4">
                Your registration is complete.
              </p>
              <p className="text-muted-foreground text-center mb-8">
                Please enter the 6-digit code sent to your email/phone.
              </p>

              {/* OTP Inputs */}
              <div className="flex justify-between mb-6 gap-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    ref={(el) => (inputsRef.current[index] = el!)}
                    className="w-12 h-12 text-center text-xl font-bold rounded-md border border-muted-foreground focus:outline-none focus:ring-2 focus:ring-pink-500 bg-background text-foreground"
                  />
                ))}
              </div>

              <Button
                onClick={handleSubmit}
                className="w-full h-12 text-lg font-bold"
                disabled={!isOtpComplete} // button active only if 6 digits entered
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  "Verify OTP"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OTPVerify;
