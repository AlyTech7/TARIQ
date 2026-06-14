import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="tariq-desert-bg flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-polisario text-2xl font-bold text-white shadow-lg shadow-polisario/30">
            ط
          </div>
          <h1 className="text-xl font-bold text-text-main">TARIQ · طريق</h1>
          <p className="mt-1 text-sm text-text-main/60">
            Sistema de reserva de transporte — campamentos de Tindouf
          </p>
        </div>
        <SignUp
          forceRedirectUrl="/ar/onboarding"
          signInUrl="/ar/sign-in"
        />
      </div>
    </div>
  );
}
