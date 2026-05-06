import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import ClubPageClient from "@/components/ClubPageClient";

export const metadata = {
  title: "Club Profile – NIT Delhi",
};

export default async function ClubPage({ searchParams }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const clubCode = session.user.clubCode;
  const clubName = session.user.clubName;
  const userEmail = session.user.email;
  const userName = session.user.name;
  const userImage = session.user.image;

  // Determine if logged-in user is a GS for this club
  // by checking if their email matches a GS-role student record
  // We pass all data to client and let it determine edit rights
  return (
    <ClubPageClient
      clubCode={clubCode}
      clubName={clubName}
      userEmail={userEmail}
      userName={userName}
      userImage={userImage}
    />
  );
}
