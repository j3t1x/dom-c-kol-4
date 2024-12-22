import React, { useState, createContext, useContext } from "react";

// Kontext pro aktuálního uživatele
const UserContext = createContext();

// Předdefinovaní uživatelé
const users = [
    { id: "674ca27e6274e4d6c0c34f91", name: "FirtsUser" },
    { id: "674ca27e6274e4d6c0c34f92", name: "SecondUser" },
    { id: "676826b2bac3fc5627331932", name: "ThirdUser" },
  ];

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(users[0]); // Výchozí uživatel

  const changeUser = (userId) => {
    const newUser = users.find((user) => user.id === userId);
    if (newUser) setCurrentUser(newUser); // Aktualizace aktuálního uživatele
  };

  return (
    <UserContext.Provider value={{ currentUser, changeUser, users }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);

// Komponenta pro přepínač uživatelů
const UserSwitcher = () => {
  const { currentUser, changeUser, users } = useUser();

  return (
    <div style={{ marginBottom: "20px" }}>
      <h3>
        Aktuální uživatel: {currentUser.name} ({currentUser.role})
      </h3>
      <select
        value={currentUser.id}
        onChange={(e) => changeUser(e.target.value)} // Aktualizace uživatele
      >
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.name} ({user.role})
          </option>
        ))}
      </select>
    </div>
  );
};

export default UserSwitcher;