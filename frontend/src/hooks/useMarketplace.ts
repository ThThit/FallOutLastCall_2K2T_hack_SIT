import { useState, useEffect } from "react";
import { marketplaceAPI } from "../services/api";
import { authAPI } from "../services/auth";

export const useMarketplace = () => {
  const [trades, setTrades] = useState<any[]>([]);
  const [demandMap, setDemandMap] = useState<Record<string, number>>({});
  const [availableItems, setAvailableItems] = useState<any[]>([]);
  const [tradeHistory, setTradeHistory] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrades = async (filters?: any) => {
    try {
      setLoading(true);
      setError(null);
      const data = await marketplaceAPI.getTrades(filters);
      setTrades(data.trades || []);
      setDemandMap(data.demandMap || {});
      setAlerts(data.alerts || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableItems = async () => {
    try {
      const token = authAPI.getToken();
      if (!token) return;
      const data = await marketplaceAPI.getAvailableItems();
      setAvailableItems(data.items || []);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const fetchTradeHistory = async () => {
    try {
      const token = authAPI.getToken();
      if (!token) return;
      const data = await marketplaceAPI.getTradeHistory();
      setTradeHistory(data.history || []);
    } catch {
      // history is non-critical, fail silently
    }
  };

  const createTrade = async (tradeData: any) => {
    try {
      const result = await marketplaceAPI.createTrade(tradeData);
      await fetchTrades();
      await fetchAvailableItems();
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateTrade = async (tradeId: string, data: any) => {
    try {
      const result = await marketplaceAPI.updateTrade(tradeId, data);
      await fetchTrades();
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const cancelTrade = async (tradeId: string) => {
    try {
      await marketplaceAPI.cancelTrade(tradeId);
      await fetchTrades();
      await fetchAvailableItems();
      await fetchTradeHistory();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const acceptTrade = async (tradeId: string, acceptorVaultItemId: string) => {
    try {
      const result = await marketplaceAPI.acceptTrade(tradeId, acceptorVaultItemId);
      await fetchTrades();
      await fetchAvailableItems();
      await fetchTradeHistory();
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    fetchTrades();
    fetchAvailableItems();
    fetchTradeHistory();
  }, []);

  return {
    trades,
    demandMap,
    availableItems,
    tradeHistory,
    alerts,
    loading,
    error,
    createTrade,
    updateTrade,
    cancelTrade,
    acceptTrade,
    fetchTrades,
    refetch: () => {
      fetchTrades();
      fetchAvailableItems();
      fetchTradeHistory();
    },
  };
};
