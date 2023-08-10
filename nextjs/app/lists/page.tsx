"use client";
import { useRouter } from "next/navigation";

const ListsPage = () => {
  const router = useRouter();

  // Redirect to the first list's details if no list is selected
  // TODO: need to get the list of lists first
  router.push(`/lists/1`);

  return (
    <div className="flex">
      <div className="w-3/4"></div>
    </div>
  );
};

export default ListsPage;
