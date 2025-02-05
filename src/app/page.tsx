import Image from "next/image";
import CreateItemModal from "@/components/modal";

export default function Home() {

  const data = [
    { name: "Adobe", owner: "CICT", subscriptionDate: "10-25-32", expirationDate: "10-26-32", type: "software" },
    { name: "Microsoft Word", owner: "CICT", subscriptionDate: "10-25-32", expirationDate: "10-26-32", type: "software" },
    { name: "Vs Code", owner: "CICT", subscriptionDate: "10-25-32", expirationDate: "10-26-32", type: "software" },
    { name: "Github", owner: "CICT", subscriptionDate: "10-25-32", expirationDate: "10-26-32", type: "software" }
  ]

  return (
    <div>
      <CreateItemModal />
      <div className="w-[95%] flex flex-row-reverse mb-2">
      <button type="button" className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-md text-sm px-5 py-2.5
       me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">Add Item</button>
      </div>
      <div className="flex justify-center">
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg w-[90%] ">
          <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Name
                </th>
                <th scope="col" className="px-6 py-3">
                  Owner
                </th>
                <th scope="col" className="px-6 py-3">
                  Subscription Date
                </th>
                <th scope="col" className="px-6 py-3">
                  Expiration Date
                </th>
                <th scope="col" className="px-6 py-3">
                  Type
                </th>
                <th scope="col" className="px-6 py-3">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((e, i) => {
                return <tr key={i} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-600">
                  <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    {e.name}
                  </th>
                  <td className="px-6 py-4">
                    {e.owner}
                  </td>
                  <td className="px-6 py-4">
                    {e.subscriptionDate}
                  </td>
                  <td className="px-6 py-4">
                    {e.expirationDate}
                  </td>
                  <td className="px-6 py-4">
                    {e.type}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex gap-2">
                      <button className="bg-blue-500 rounded p-1 "><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="#ffff" fill="none">
                        <path d="M15.2141 5.98239L16.6158 4.58063C17.39 3.80646 18.6452 3.80646 19.4194 4.58063C20.1935 5.3548 20.1935 6.60998 19.4194 7.38415L18.0176 8.78591M15.2141 5.98239L6.98023 14.2163C5.93493 15.2616 5.41226 15.7842 5.05637 16.4211C4.70047 17.058 4.3424 18.5619 4 20C5.43809 19.6576 6.94199 19.2995 7.57889 18.9436C8.21579 18.5877 8.73844 18.0651 9.78375 17.0198L18.0176 8.78591M15.2141 5.98239L18.0176 8.78591" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M11 20H17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                      </svg></button>
                      <button className="bg-red-500 rounded p-1"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="#ffff" fill="none">
                        <path d="M19.5 5.5L18.8803 15.5251C18.7219 18.0864 18.6428 19.3671 18.0008 20.2879C17.6833 20.7431 17.2747 21.1273 16.8007 21.416C15.8421 22 14.559 22 11.9927 22C9.42312 22 8.1383 22 7.17905 21.4149C6.7048 21.1257 6.296 20.7408 5.97868 20.2848C5.33688 19.3626 5.25945 18.0801 5.10461 15.5152L4.5 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        <path d="M3 5.5H21M16.0557 5.5L15.3731 4.09173C14.9196 3.15626 14.6928 2.68852 14.3017 2.39681C14.215 2.3321 14.1231 2.27454 14.027 2.2247C13.5939 2 13.0741 2 12.0345 2C10.9688 2 10.436 2 9.99568 2.23412C9.8981 2.28601 9.80498 2.3459 9.71729 2.41317C9.32164 2.7167 9.10063 3.20155 8.65861 4.17126L8.05292 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        <path d="M9.5 16.5L9.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        <path d="M14.5 16.5L14.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg></button>
                    </div>
                  </td>
                </tr>
              })}

            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
