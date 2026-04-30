import AsyncStorage from '@react-native-async-storage/async-storage';

const SLEEP_LOGS_KEY = 'sleepLogs';
const BABY_LOGS_KEY = 'babyLogs';
const FRIENDS_KEY = 'friends';

// ---- UYKU KAYITLARI ----

export const saveSleepLog = async (log) => {
  try {
    const existing = await getSleepLogs();
    const updated = [log, ...existing];
    await AsyncStorage.setItem(SLEEP_LOGS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('saveSleepLog error:', e);
  }
};

export const getSleepLogs = async () => {
  try {
    const data = await AsyncStorage.getItem(SLEEP_LOGS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

export const getLogsForPeriod = async (period) => {
  const logs = await getSleepLogs();
  const now = new Date();
  return logs.filter((log) => {
    const logDate = new Date(log.date);
    if (period === 'hafta') {
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      return logDate >= weekAgo;
    }
    if (period === 'ay') {
      const monthAgo = new Date(now);
      monthAgo.setDate(now.getDate() - 30);
      return logDate >= monthAgo;
    }
    if (period === 'yıl') {
      const yearAgo = new Date(now);
      yearAgo.setFullYear(now.getFullYear() - 1);
      return logDate >= yearAgo;
    }
    return true;
  });
};

// ---- BEBEK KAYITLARI ----

export const saveBabyLog = async (log) => {
  try {
    const existing = await getBabyLogs();
    const updated = [log, ...existing];
    await AsyncStorage.setItem(BABY_LOGS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('saveBabyLog error:', e);
  }
};

export const getBabyLogs = async () => {
  try {
    const data = await AsyncStorage.getItem(BABY_LOGS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

export const getTodayBabyLogs = async () => {
  const logs = await getBabyLogs();
  const today = new Date().toDateString();
  return logs.filter((l) => new Date(l.startTime).toDateString() === today);
};

// ---- ARKADAŞLAR ----

export const getFriends = async () => {
  try {
    const data = await AsyncStorage.getItem(FRIENDS_KEY);
    return data ? JSON.parse(data) : [
      { id: '1', name: 'Zeynep K.', initials: 'ZK', avgHours: 8.2, score: 94, color: '#27AA62', todayHours: 8.0 },
      { id: '2', name: 'Mehmet A.', initials: 'MA', avgHours: 6.1, score: 71, color: '#EF9F27', todayHours: 5.5 },
      { id: '3', name: 'Buse Ç.', initials: 'BÇ', avgHours: 5.5, score: 60, color: '#D85A30', todayHours: 4.0 },
    ];
  } catch (e) {
    return [];
  }
};

export const saveFriend = async (friend) => {
  try {
    const existing = await getFriends();
    const updated = [...existing, friend];
    await AsyncStorage.setItem(FRIENDS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('saveFriend error:', e);
  }
};