import { useSession } from "next-auth/react";

export default function Page() {
  const { data: session, status } = useSession();

  console.log(session, status);
  if (status === "loading") {
    return <p>Loading...</p>;
  }
  console.log(session, status);
  if (status === "unauthenticated") {
    return <p>Access Denied</p>;
  }

  //fetch wines from the database
  async function getWineries(): Promise<void> {
    "use server";
    const fetchedWineries = await fetch("/api/wineries"); // replace with your API endpoint
    const wineriesData = await fetchedWineries.json();
  }
  console.log(session, status);
  return (
    <>
      <h1>Protected Page</h1>
      <p>You can view this page because you are signed in.</p>

      <p></p>
    </>
  );
  console.log(session, status);
}
