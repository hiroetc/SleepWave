export const formatTime = (secs) => {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

export const calcWakeTime = (bedHour, bedMin, hoursToSleep) => {
  const totalMins = bedHour * 60 + bedMin + hoursToSleep * 60;
  const wakeHour = Math.floor((totalMins % 1440) / 60);
  const wakeMin = totalMins % 60;
  return `${String(wakeHour).padStart(2, '0')}:${String(wakeMin).padStart(2, '0')}`;
};

export const getCurrentTime = () => {
  const now = new Date();
  return {
    hour: now.getHours(),
    min: now.getMinutes(),
    sec: now.getSeconds(),
    display: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
    full: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`,
  };
};

export const getDayName = () => {
  const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
  return days[new Date().getDay()];
};

export const getDateString = () => {
  const now = new Date();
  const months = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
  return `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
};

export const getSleepQualityLabel = (score) => {
  if (score >= 90) return { label: 'Mükemmel', color: '#27AA62' };
  if (score >= 75) return { label: 'İyi', color: '#27AA62' };
  if (score >= 55) return { label: 'Orta', color: '#EF9F27' };
  return { label: 'Kötü', color: '#D85A30' };
};