import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  fetchShoppingLists,
  fetchArchivedShoppingLists,
  addShoppingList,
  deleteShoppingList,
  toggleArchiveStatus,
} from "../api";
import { useUser } from "./UserSwitcher"; // Import kontextu uživatele
import "./ShoppingListsPage.css";

const ShoppingListsPage = () => {
  const [shoppingLists, setShoppingLists] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [newListTitle, setNewListTitle] = useState("");
  const [listToDelete, setListToDelete] = useState(null);
  const [isArchivedView, setIsArchivedView] = useState(false); // Stav přepínače
  const { currentUser } = useUser();

  useEffect(() => {
    const loadShoppingLists = async () => {
      if (!currentUser) return; // Pokud není aktuální uživatel, neprováděj načtení

      try {
        const response = isArchivedView
          ? await fetchArchivedShoppingLists(currentUser.id) // Opravené volání API pro archivované seznamy
          : await fetchShoppingLists(currentUser.id); // Volání API pro aktivní seznamy

        const lists = response.data.shoppingLists.map((list) => ({
          id: list._id,
          title: list.title,
          isArchived: list.isArchived,
        }));
        setShoppingLists(lists);
      } catch (error) {
        console.error("Failed to fetch shopping lists", error);
      }
    };

    loadShoppingLists();
  }, [currentUser, isArchivedView]); // Načtení dat při změně uživatele nebo přepínače

  const handleAddList = async () => {
    if (!newListTitle.trim()) return;

    try {
      const response = await addShoppingList(newListTitle, currentUser.id); // Předá user-id
      setShoppingLists([
        ...shoppingLists,
        { id: response.data.shoppingListId, title: newListTitle, isArchived: false },
      ]);
      setNewListTitle("");
      setModalOpen(false);
    } catch (error) {
      console.error("Failed to add shopping list", error);
    }
  };

  const handleDeleteList = async () => {
    if (!listToDelete) return;

    try {
      await deleteShoppingList(listToDelete.id, currentUser.id); // Předá user-id
      setShoppingLists(
        shoppingLists.filter((list) => list.id !== listToDelete.id)
      );
      setListToDelete(null);
    } catch (error) {
      console.error("Failed to delete shopping list", error);
    }
  };

  const handleToggleArchive = async (listId, isArchived) => {
    try {
      await toggleArchiveStatus(listId, isArchived, currentUser.id); // Volání API
      setShoppingLists((prevLists) =>
        prevLists.map((list) =>
          list.id === listId ? { ...list, isArchived } : list
        )
      );
    } catch (error) {
      console.error("Failed to toggle archive status", error);
    }
  };

  if (!currentUser) {
    return <div>Please select a user to view shopping lists.</div>;
  }

  return (
    <div className="shopping-lists-page">
      <h1 className="title">
        {isArchivedView ? "Archived Shopping Lists" : "My Shopping Lists"}
      </h1>

      <button
        className="toggle-view-button"
        onClick={() => setIsArchivedView(!isArchivedView)}
      >
        {isArchivedView ? "View Active Lists" : "View Archived Lists"}
      </button>

      <button className="add-button" onClick={() => setModalOpen(true)}>
        + Add New List
      </button>
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>Add New Shopping List</h2>
            <input
              type="text"
              value={newListTitle}
              onChange={(e) => setNewListTitle(e.target.value)}
              placeholder="Enter list title"
              className="input"
            />
            <div className="modal-actions">
              <button onClick={handleAddList} className="confirm-button">
                Add
              </button>
              <button
                onClick={() => setModalOpen(false)}
                className="cancel-button"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="shopping-lists-container">
        {shoppingLists.map((list) => (
          <div key={list.id} className="shopping-list-card">
            <Link
              to={`/shopping-lists/${list.id}`}
              state={{ title: list.title }}
              className="shopping-list-title"
            >
              {list.title}
            </Link>
            <button
              className="archive-button"
              onClick={() => handleToggleArchive(list.id, !list.isArchived)}
            >
              {list.isArchived ? "Unarchive" : "Archive"}
            </button>
            {!isArchivedView && (
              <button
                className="delete-button"
                onClick={() => setListToDelete(list)}
              >
                🗑️
              </button>
            )}
          </div>
        ))}
      </div>

      {listToDelete && (
        <div className="modal">
          <div className="modal-content">
            <h2>Confirm Deletion</h2>
            <p>
              Are you sure you want to delete the list "{listToDelete.title}"?
            </p>
            <div className="modal-actions">
              <button onClick={handleDeleteList} className="confirm-button">
                Yes, Delete
              </button>
              <button
                onClick={() => setListToDelete(null)}
                className="cancel-button"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingListsPage;
