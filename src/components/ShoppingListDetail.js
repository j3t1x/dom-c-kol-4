import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  fetchShoppingList,
  addItem,
  deleteItem,
  toggleItemStatus,
  addMember,
  removeMember,
  leaveList, // Přidáno
} from "../api";
import { useUser } from "./UserSwitcher"; // Import User Context
import "./ShoppingListDetail.css";

const ShoppingListDetail = () => {
  const { id } = useParams();
  const [shoppingList, setShoppingList] = useState(null);
  const [newItem, setNewItem] = useState("");
  const [newMemberId, setNewMemberId] = useState("");
  const { currentUser } = useUser(); // Získání aktuálního uživatele

  useEffect(() => {
    const loadShoppingList = async () => {
      try {
        const response = await fetchShoppingList(id, currentUser.id); // Předá user-id
        setShoppingList({
          id: response.data.shoppingList._id,
          ...response.data.shoppingList,
        });
      } catch (error) {
        console.error("Failed to fetch shopping list:", error);
      }
    };

    if (id && currentUser) {
      loadShoppingList();
    }
  }, [id, currentUser]);

  const handleAddItem = async () => {
    if (!newItem.trim()) return;

    try {
      const response = await addItem(id, newItem, 1, currentUser.id); // Předá user-id
      setShoppingList((prev) => ({
        ...prev,
        items: [
          ...prev.items,
          { id: response.data.itemId, name: newItem, purchased: false },
        ],
      }));
      setNewItem("");
    } catch (error) {
      console.error("Failed to add item", error);
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      await deleteItem(id, itemId, currentUser.id); // Předá user-id
      setShoppingList((prev) => ({
        ...prev,
        items: prev.items.filter((item) => item._id !== itemId),
      }));
    } catch (error) {
      console.error("Failed to delete item", error);
    }
  };

  const handleToggleItem = async (itemId, newStatus) => {
    try {
      await toggleItemStatus(id, itemId, newStatus, currentUser.id); // Předá user-id
      setShoppingList((prev) => ({
        ...prev,
        items: prev.items.map((item) =>
          item._id === itemId ? { ...item, purchased: newStatus } : item
        ),
      }));
    } catch (error) {
      console.error("Failed to toggle item status", error);
    }
  };

  const handleAddMember = async () => {
    if (!newMemberId.trim()) {
      console.error("Member ID is required.");
      return;
    }

    try {
      await addMember(id, newMemberId, currentUser.id); // Posíláme data
      setShoppingList((prev) => ({
        ...prev,
        members: [...prev.members, { id: newMemberId, name: `User ${newMemberId}` }],
      }));
      setNewMemberId(""); // Vyčistí vstup
    } catch (error) {
      console.error("Failed to add member:", error.response?.data || error.message);
    }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      await removeMember(id, memberId, currentUser.id); // Odesílá požadavek na backend
      setShoppingList((prev) => ({
        ...prev,
        members: prev.members.filter((member) => member.userId !== memberId),
      }));
    } catch (error) {
      console.error("Failed to remove member:", error.response?.data || error.message);
    }
  };

  const handleLeaveList = async () => {
    console.log("Attempting to leave list with User 11ID:", currentUser.id);

    try {
      console.log("Attempting to leave list with User 22ID:", currentUser.id);

      await leaveList(id, currentUser.id); // Odesílá user-id pro odchod
      alert("You have left the shopping list.");
      // Případně přesměrování nebo aktualizace stavu:
      setShoppingList(null); // Zobrazení prázdné stránky
    } catch (error) {
      console.error("Failed to leave the list:", error.response?.data || error.message);
    }
  };

  if (!shoppingList) return <div>Loading...</div>;

  return (
    <div className="shopping-list-detail">
      <h1>{shoppingList.title}</h1>

      {/* Items Section */}
      <div className="items-section">
        <h2>Items</h2>
        <ul className="items-list">
          {shoppingList.items.map((item) => (
            <li key={item._id} className="item-row">
              <span>{item.name}</span>
              <input
                type="checkbox"
                checked={item.purchased}
                onChange={() => handleToggleItem(item._id, !item.purchased)}
              />
              <button onClick={() => handleDeleteItem(item._id)}>Delete</button>
            </li>
          ))}
        </ul>

        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder="Add new item"
        />
        <button onClick={handleAddItem}>Add Item</button>
      </div>

      {/* Members Section */}
      <div className="members-section">
        <h2>Members</h2>
        <ul>
          {shoppingList.members.map((member) => (
            <li key={member.userId}>
              {member.name}
              <button onClick={() => handleRemoveMember(member.userId)}>Remove</button>
            </li>
          ))}
        </ul>
        <input
          type="text"
          value={newMemberId}
          onChange={(e) => setNewMemberId(e.target.value)}
          placeholder="Enter member ID"
        />
        <button onClick={handleAddMember}>Add Member</button>
        <button onClick={handleLeaveList} className="leave-button">Leave List</button>
      </div>
    </div>
  );
};

export default ShoppingListDetail;
