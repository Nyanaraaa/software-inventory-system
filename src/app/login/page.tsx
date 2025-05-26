import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="./assets/ublogo.png" alt="UB logo" className="mx-auto h-20 w-auto mb-6 drop-shadow-lg" />
        </div>
        <LoginForm />
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">© 2025 University of Batangas. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
