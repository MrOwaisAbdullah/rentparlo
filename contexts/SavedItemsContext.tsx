"use client";

import React, {
  createContext,
  useReducer,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import { Listing } from "@/types";

// Define the shape of our saved items state
interface SavedItemsState {
  savedItems: Listing[];
}

// Define what values our context will provide
interface SavedItemsContextValue {
  state: SavedItemsState;
  dispatch: React.Dispatch<SavedItemsAction>;
  totalItems: number;
}

// Define the action types for the saved items
type SavedItemsAction =
  | { type: "SET_SAVED_ITEMS"; products: Listing[] }
  | { type: "ADD_TO_SAVED_ITEMS"; product: Listing }
  | { type: "REMOVE_FROM_SAVED_ITEMS"; id: string }
  | { type: "CLEAR_SAVED_ITEMS" };

// Create our reducer to handle saved items state changes
const savedItemsReducer = (
  state: SavedItemsState,
  action: SavedItemsAction
): SavedItemsState => {
  switch (action.type) {
    case "SET_SAVED_ITEMS":
      // Replace entire saved items list (useful for initialization)
      return { savedItems: action.products || [] };

    case "ADD_TO_SAVED_ITEMS": {
      // Don't add if product already exists in saved items
      if (
        action.product &&
        !state.savedItems.some((item) => item._id === action.product._id)
      ) {
        return {
          ...state,
          savedItems: [...state.savedItems, action.product],
        };
      }
      return state;
    }

    case "REMOVE_FROM_SAVED_ITEMS":
      // Remove specific product from saved items
      return {
        ...state,
        savedItems: state.savedItems.filter((item) => item._id !== action.id),
      };

    case "CLEAR_SAVED_ITEMS":
      // Empty the saved items list
      return { savedItems: [] };

    default:
      return state;
  }
};

// Create the context
const SavedItemsContext = createContext<SavedItemsContextValue | undefined>(
  undefined
);

// Create the provider component
export const SavedItemsProvider = ({ children }: { children: ReactNode }) => {
  // Initialize reducer with localStorage data if available
  const [state, dispatch] = useReducer(
    savedItemsReducer,
    { savedItems: [] },
    (initialState) => {
      if (typeof window !== "undefined") {
        try {
          const storedSavedItems = localStorage.getItem("savedItems");
          return storedSavedItems
            ? { savedItems: JSON.parse(storedSavedItems) }
            : initialState;
        } catch (error) {
          console.error("Error loading saved items from localStorage:", error);
          return initialState;
        }
      }
      return initialState;
    }
  );

  // Calculate total items in saved items list
  const totalItems = state.savedItems.length;

  // Save to localStorage whenever saved items list changes
  useEffect(() => {
    try {
      localStorage.setItem("savedItems", JSON.stringify(state.savedItems));
    } catch (error) {
      console.error("Error saving saved items to localStorage:", error);
    }
  }, [state.savedItems]);


  const contextValue: SavedItemsContextValue = {
    state,
    dispatch,
    totalItems,
  };

  return (
    <SavedItemsContext.Provider value={contextValue}>
      {children}
    </SavedItemsContext.Provider>
  );
};

// Custom hook to use the saved items list
export const useSavedItems = () => {
  const context = useContext(SavedItemsContext);
  if (!context) {
    throw new Error("useSavedItems must be used within a SavedItemsProvider");
  }
  return context;
};