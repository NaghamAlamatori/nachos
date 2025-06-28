import { LoginForm } from "@/components/LoginForm";
import logoImage from "@/assets/nachos-yellow-blob.png";

const Login = () => {
  return (
    <div className="flex min-h-screen bg-nachosBg flex-col md:flex-row">
      {/* Left side: Yellow Blob */}
      <div className="w-full md:w-1/3 flex items-start justify-start">
        <img
          src={logoImage}
          alt="Nachos Background"
          className="object-contain h-auto w-full sm:w-[400px] md:w-[450px] lg:w-[500px] xl:w-[590px]"
        />
      </div>

      {/* Right side: Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-8">
        <div className="mb-8 w-full max-w-md">
          <div className="flex flex-col items-center">
            {/* Administration */}
            <p className="text-black font-poppins text-[10px] mb-2 ml-[-80px]">Administration</p>

            {/* NACHOS */}
            <h1 className="text-nachosYellow text-[70px] font-display leading-none tracking-tight mb-2">
              NACHOS
            </h1>

            {/* PLATFORM */}
            <p
              className="text-nachosYellow font-poppins font-bold uppercase text-[10px] tracking-widest"
              style={{ letterSpacing: "1em", marginTop: "-4px" }}
            >
              PLATFORM
            </p>
          </div>
        </div>

        {/* Login Form */}
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default Login;