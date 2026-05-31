import { useState, useEffect } from "react";
import { vaultAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";

export const useVault = () => {
  const { isLoggedIn } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVaultData = async (filters?: any) => {
    try {
      setLoading(true);
      setError(null);
      const data = await vaultAPI.getItems(filters);
      setItems(data.items || []);
      setStats(data.stats || {});
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (vaultData: any) => {
    try {
      const result = await vaultAPI.addItem(vaultData);
      await fetchVaultData();
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const removeItem = async (itemId: string, quantity?: number) => {
    try {
      await vaultAPI.removeItem(itemId, quantity);
      await fetchVaultData();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    // Only fetch vault data if user is authenticated
    if (isLoggedIn) {
      fetchVaultData();
    } else {
      setLoading(false);
      setError("Not authenticated");
    }
  }, [isLoggedIn]);

  return {
    items,
    stats,
    loading,
    error,
    addItem,
    removeItem,
    refetch: fetchVaultData,
  };
};
