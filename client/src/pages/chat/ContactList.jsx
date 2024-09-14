import { Avatar, AvatarImage } from "@radix-ui/react-avatar";
import { getColor } from "@/utils/constants";
import { useAppStore } from "@/store";

const ContactList = ({ contacts = [], isChannel = false }) => {
  const {
    setSelectedChatData,
    selectedChatData,
    setSelectedChatType,
    setSelectedChatMessages,
  } = useAppStore();

  const handleClickContact = (contact) => {
    if (isChannel) setSelectedChatType("channel");
    else setSelectedChatType("contact");
    setSelectedChatData(contact);
    if (selectedChatData && selectedChatData._id !== contact._id) {
      setSelectedChatMessages([]);
    }
  };
  // console.log(contacts)
  return (
    <div className="mt-5 h-full overflow-hidden">
  <div className="h-full overflow-y-auto pr-4 space-y-2 scrollbar-hide">
    {contacts.length > 0 ? (
      contacts.map((contact) => (
        <div
          key={contact._id}
          className={`
            group relative overflow-hidden rounded-xl shadow-md
            transition-all duration-300 ease-in-out cursor-pointer
            transform hover:scale-102 hover:shadow-lg
            ${
              selectedChatData && selectedChatData._id === contact._id
                ? "bg-violet-600 border-violet-500 "
                : "bg-gray-800 hover:bg-gray-750"
            }
          `}
          onClick={() => handleClickContact(contact)}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
          <div className="relative flex items-center gap-4 p-3 z-10">
            <Avatar className="h-12 w-12 rounded-full ring-2 ring-violet-400 ring-opacity-50 shadow-md overflow-hidden transition-all duration-300 group-hover:ring-opacity-100">
              {!isChannel ? (
                contact.image ? (
                  <AvatarImage
                    className="object-cover h-full w-full transition-transform duration-300 group-hover:scale-110"
                    src={contact.image}
                    alt={`${contact.firstName} ${contact.lastName}`}
                  />
                ) : (
                  <div
                    className={`
                      uppercase flex items-center justify-center h-full w-full
                      text-lg font-bold bg-opacity-80 group-hover:bg-opacity-100
                      transition-all duration-300 ${getColor(contact.color)}
                    `}
                  >
                    {contact?.firstName?.charAt(0) ||
                      contact?.email?.charAt(0) ||
                      "N/A"}
                  </div>
                )
              ) : (
                <div className="uppercase flex items-center justify-center h-full w-full rounded-full text-lg font-bold bg-gray-600 text-white transition-all duration-300 group-hover:bg-gray-500">
                  {contact?.name?.charAt(0) || "#"}
                </div>
              )}
            </Avatar>

            <div className="flex-grow">
              <div className="text-white font-semibold group-hover:text-violet-200 transition-colors duration-300">
                {!isChannel
                  ? contact?.firstName && contact?.lastName
                    ? `${contact.firstName} ${contact.lastName}`
                    : contact?.email || "No Name"
                  : contact?.name || "No Channel Name"}
              </div>
              <div className="text-white text-sm truncate group-hover:text-gray-300 transition-colors duration-300">
                {isChannel
                  ? `${contact.members?.length+1 || 1} members`
                  : contact?.email || "No email"}
              </div>
            </div>
          </div>
        </div>
      ))
    ) : (
      <div className="text-center py-8">
        <p className="text-lg text-gray-400 font-medium">
          No {isChannel ? "Channels" : "Contacts"} Available
        </p>
        <p className="text-sm text-gray-500 mt-2">
          {isChannel
            ? "Create a new channel to get started!"
            : "Add some contacts to begin chatting!"}
        </p>
      </div>
    )}
  </div>
</div>

  );
};

export default ContactList;