"use client"

import { useLoading } from "@/context/loadingContext";
import { useUser } from "@/context/userContext";
import { authService } from "@/services/authService";
import { Col, Form, Image, Input, message, Row } from "antd";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const { showLoading, hideLoading } = useLoading();
  const { setUser, isAuthenticated, loading } = useUser();

  const router = useRouter()
  const [FormLogin] = Form.useForm()

  const [isFilled, setIsFilled] = useState(false)

  const handleChangeFields = () => {
    const values = FormLogin.getFieldsValue()
    if (values.username?.length > 0 && values.password?.length > 0) {
      setIsFilled(true)
    } else {
      setIsFilled(false)
    }
  }

  const handleFinish = async () => {
    showLoading("Sedang menghubungkan...")
    const values = FormLogin.getFieldsValue()
    try {
      const response = await authService.login(values.username, values.password);
      if (response?.data) {
        // Use UserContext to set user data
        setUser(response.data)

        message.success("Berhasil login")
        
        // Use replace instead of push to prevent back navigation to login
        showLoading("Redirecting...")
        router.replace("/collaborator")
      } else {
        message.error("Username atau password salah")
        hideLoading()
      }

    } catch (err) {
      console.error("Login error:", err);
      message.error("Gagal login, mohon periksa kembali username dan password anda")
      hideLoading()
    }
    // Note: Don't hide loading here if login was successful, 
    // let the redirect handle the loading state
  }

  useEffect(() => {
    // Redirect if already authenticated
    if (!loading && isAuthenticated) {
      showLoading("Redirecting...");
      router.replace("/collaborator");
    }
  }, [isAuthenticated, loading, router, showLoading]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Don't render login form if user is authenticated (prevent flash)
  if (isAuthenticated) {
   return <></>
  }


  return (
    <main>
      <Row>
        <Col lg={8} span={24} className="h-[100dvh]">
          <svg viewBox="0 0 360 360" fill="none" xmlns="http://www.w3.org/2000/svg"
            style={{
              position: "absolute",
              top: '-100px',
              zIndex: -1
            }}
          >
            <path d="M20.5386 -309V411" stroke="#EBEBEB" />
            <path d="M75.9231 -309V411" stroke="#EBEBEB" />
            <path d="M131.308 -309V411" stroke="#EBEBEB" />
            <path d="M186.692 -309V411" stroke="#EBEBEB" />
            <path d="M242.077 -309V411" stroke="#EBEBEB" />
            <path d="M297.462 -309V411" stroke="#EBEBEB" />
            <path d="M352.846 -309V411" stroke="#EBEBEB" />
            <path d="M-201 23.3077H519" stroke="#EBEBEB" />
            <path d="M-201 78.6923H519" stroke="#EBEBEB" />
            <path d="M-201 134.077H519" stroke="#EBEBEB" />
            <path d="M-201 189.462H519" stroke="#EBEBEB" />
            <path d="M-201 244.846H519" stroke="#EBEBEB" />
            <path d="M-201 300.231H519" stroke="#EBEBEB" />
            <path d="M-201 355.615H519" stroke="#EBEBEB" />
            <path d="M-201 411H519" stroke="#EBEBEB" />
          </svg>


          <div className="w-full h-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-8 glass-effect">
            <h1 className="text-3xl font-semibold">Masuk</h1>
            <Form
              form={FormLogin}
              layout="vertical"
              onFieldsChange={handleChangeFields}
              onFinish={handleFinish}
            >
              <div className="text-xs font-medium text-gray mb-2 mt-12">NIK PI SMART <span className="text-red-600">*</span></div>
              <Form.Item
                className="mt-2"
                name={"username"}
                rules={[{ required: true, message: "Tolong masukan No. PI SMART anda" }]}
              >
                <Input className="mt-2" placeholder="Masukan No. PI SMART" size="large"></Input>
              </Form.Item>
              <div className="text-xs font-medium text-gray">Password <span className="text-red-600">*</span></div>
              <Form.Item
                name={"password"}
                rules={[{ required: true, message: "Tolong masukan Password anda" }]}
              >
                <Input.Password className="mt-2" placeholder="Masukan password" size="large"></Input.Password>
              </Form.Item>

              <button
                type="submit"
                className={`py-3 w-full rounded font-semibold text-white mt-3 ${isFilled ? 'bg-blue' : 'bg-blue-200'}`}
                disabled={!isFilled}
              >
                Masuk
              </button>

            </Form>

            <div className="mt-28">
              <div className="text-center text-blue font-medium text-xs cursor-pointer">
                Dapatkan Bantuan
              </div>

              <div className="text-xs mt-10 text-gray font-regular">
                Dengan melanjutkan, Anda menyetujui Syarat dan Ketentuan dan mengakui Pemberitahuan Privasi kami
              </div>
            </div>
          </div>

          <div className="text-center text-xs font-regular w-full"
            style={{
              position: 'absolute',
              bottom: '10px'
            }}
          >
            © 2025 PT Pupuk Indonesia
          </div>
        </Col>
        <Col lg={16} span={24} className="disnone h-[100dvh]">
          <img src="https://geospi.vercel.app/sawah.png" style={{
            height: '100vh',
            width: '100%'
          }} />
        </Col>
      </Row>
    </main>
  );
}
