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
  async function getStorages(): Promise<void> {
    "use server";
    const fetchedStorages = await fetch("/api/storages"); // replace with your API endpoint
    const storagesData = await fetchedStorages.json();
  }
  console.log(session, status);
  return (
    <>
      <div className="container mx-auto px-4">
        <h3>Your stashes</h3>
        <button>Add New Stash</button>
      </div>

      <p></p>
    </>
  );
  console.log(session, status);
}
