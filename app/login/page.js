import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import LoginClient from "@/components/LoginClient";

export const metadata = {
  title: "Login – NIT Delhi Club Management",
};

export default async function LoginPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect(`/club?code=${session.user.clubCode}`);
  }

  return <LoginClient />;
}
