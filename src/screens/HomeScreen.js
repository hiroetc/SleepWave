import React from 'react';
import { View, Text, TouchableOpacity, Alert, Modal, AppState } from 'react-native';
import { useAudioPlayer } from 'expo-audio';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { formatTime, calcWakeTime, getCurrentTime, getDayName, getDateString } from '../utils/helpers';
import { saveSleepLog } from '../utils/storage';
import styles, { C } from '../styles';

const SLEEP_OPTIONS = [6, 7, 8, 9];

const SOUND_FILES = {
  '🌧 Yağmur':    require('../../assets/sounds/rain.mp3'),
  '🌊 Okyanus':   require('../../assets/sounds/waves.mp3'),
  '🔥 Ateş':      require('../../assets/sounds/fire.mp3'),
  '🍃 Rüzgar':    require('../../assets/sounds/wind.mp3'),
  '🎵 Beyaz ses': require('../../assets/sounds/white_noise.mp3'),
};

const SOUND_LABELS = ['🌧 Yağmur', '🌊 Okyanus', '🔥 Ateş', '🍃 Rüzgar', '🎵 Beyaz ses', '🌙 Sessizlik'];

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function HomeScreen() {
  const [sleeping, setSleeping]         = React.useState(false);
  const [elapsed, setElapsed]           = React.useState(0);
  const [selectedSound, setSelected]    = React.useState(null);
  const [selectedGoal, setSelectedGoal] = React.useState(8);
  const [ratingModal, setRatingModal]   = React.useState(false);
  const [rating, setRating]             = React.useState(0);
  const [clock, setClock]               = React.useState(getCurrentTime());
  const [alarmId, setAlarmId]           = React.useState(null);

  const sleepStart  = React.useRef(null);
  const appState    = React.useRef(AppState.currentState);

  // Ses playerları
  const rainPlayer  = useAudioPlayer(SOUND_FILES['🌧 Yağmur']);
  const wavePlayer  = useAudioPlayer(SOUND_FILES['🌊 Okyanus']);
  const firePlayer  = useAudioPlayer(SOUND_FILES['🔥 Ateş']);
  const windPlayer  = useAudioPlayer(SOUND_FILES['🍃 Rüzgar']);
  const whitePlayer = useAudioPlayer(SOUND_FILES['🎵 Beyaz ses']);

  const players = React.useMemo(() => ({
    '🌧 Yağmur':    rainPlayer,
    '🌊 Okyanus':   wavePlayer,
    '🔥 Ateş':      firePlayer,
    '🍃 Rüzgar':    windPlayer,
    '🎵 Beyaz ses': whitePlayer,
  }), []);

  const now = new Date();
  const wakeTime = calcWakeTime(now.getHours(), now.getMinutes(), selectedGoal);

  // Saat güncelle
  React.useEffect(() => {
    const t = setInterval(() => setClock(getCurrentTime()), 1000);
    return () => clearInterval(t);
  }, []);

  // Uyku oturumunu geri yükle
  React.useEffect(() => {
    restoreSleepState();
    Notifications.requestPermissionsAsync();
  }, []);

  // AppState değişince elapsed güncelle
  React.useEffect(() => {
    const sub = AppState.addEventListener('change', nextState => {
      if (appState.current.match(/inactive|background/) && nextState === 'active') {
        if (sleepStart.current) {
          const diff = Math.floor((Date.now() - sleepStart.current.getTime()) / 1000);
          setElapsed(diff);
        }
      }
      appState.current = nextState;
    });
    return () => sub.remove();
  }, []);

  // Zamanlayıcı — başlangıç zamanından hesapla
  React.useEffect(() => {
    let iv;
    if (sleeping) {
      iv = setInterval(() => {
        if (sleepStart.current) {
          const diff = Math.floor((Date.now() - sleepStart.current.getTime()) / 1000);
          setElapsed(diff);
        }
      }, 1000);
    }
    return () => { if (iv) clearInterval(iv); };
  }, [sleeping]);

  const restoreSleepState = async () => {
    try {
      const saved = await AsyncStorage.getItem('sleepSession');
      if (saved) {
        const { startTime, goal, sound, alarmId: savedId } = JSON.parse(saved);
        sleepStart.current = new Date(startTime);
        const diff = Math.floor((Date.now() - new Date(startTime).getTime()) / 1000);
        setElapsed(diff);
        setSleeping(true);
        setSelectedGoal(goal);
        setSelected(sound);
        if (savedId) setAlarmId(savedId);
        if (sound && players[sound]) {
          players[sound].loop = true;
          players[sound].play();
        }
      }
    } catch (e) {}
  };

  const saveSleepSession = async (startTime, goal, sound, id) => {
    try {
      await AsyncStorage.setItem('sleepSession', JSON.stringify({
        startTime: startTime.toISOString(), goal, sound, alarmId: id,
      }));
    } catch (e) {}
  };

  const clearSleepSession = async () => {
    try { await AsyncStorage.removeItem('sleepSession'); } catch (e) {}
  };

  const stopAllSounds = () => {
    Object.values(players).forEach(p => {
      try { p.pause(); } catch (_) {}
    });
  };

  const playSound = (label) => {
    stopAllSounds();
    if (label && players[label]) {
      players[label].loop = true;
      players[label].play();
    }
  };

  const handleSoundSelect = (s) => {
    setSelected(s);
    playSound(s);
  };

  const handleSleep = async () => {
    if (!sleeping) {
      const start = new Date();
      sleepStart.current = start;
      setElapsed(0);
      setSleeping(true);
      if (selectedSound) playSound(selectedSound);
      try {
        const id = await Notifications.scheduleNotificationAsync({
          content: {
            title: '⏰ Uyanma Zamanı!',
            body: `${selectedGoal} saat uyudun. Günaydın! 🌅`,
            sound: true,
            priority: Notifications.AndroidNotificationPriority.MAX,
            vibrate: [0, 500, 200, 500, 200, 500],
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: selectedGoal * 60 * 60,
            repeats: false,
          },
        });
        setAlarmId(id);
        await saveSleepSession(start, selectedGoal, selectedSound, id);
      } catch (e) { console.log('Alarm:', e); }
    } else {
      setSleeping(false);
      stopAllSounds();
      await clearSleepSession();
      if (alarmId) {
        try { await Notifications.cancelScheduledNotificationAsync(alarmId); } catch (_) {}
        setAlarmId(null);
      }
      setRatingModal(true);
    }
  };

  const handleSave = async () => {
    await saveSleepLog({
      date: sleepStart.current.toISOString(),
      startTime: sleepStart.current.toISOString(),
      endTime: new Date().toISOString(),
      durationSecs: elapsed,
      durationHours: parseFloat((elapsed / 3600).toFixed(2)),
      rating: rating || 3,
      quality: rating >= 4 ? 'iyi' : rating >= 2 ? 'normal' : 'kötü',
      sound: selectedSound,
    });
    setRatingModal(false);
    setRating(0);
    Alert.alert('Kaydedildi', `${formatTime(elapsed)} uyudun.`, [{ text: 'Tamam' }]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg, paddingTop: 48 }}>

      <View style={{ alignItems: 'center', marginBottom: 10 }}>
        <Text style={styles.title}>SLEEPWAVE</Text>
      </View>

      {/* Saat kutusu */}
      <View style={{ paddingHorizontal: 20, marginBottom: 12 }}>
        <View style={{
          backgroundColor: C.bg2, borderRadius: 20, paddingVertical: 16,
          paddingHorizontal: 24, borderWidth: 1,
          borderColor: sleeping ? C.green : C.bg3, alignItems: 'center',
        }}>
          <Text style={{ color: C.dim, fontSize: 11, letterSpacing: 1, marginBottom: 4 }}>
            {getDayName().toUpperCase()}, {getDateString()}
          </Text>
          <Text style={{ fontSize: sleeping ? 32 : 52, fontWeight: '700', color: C.white, letterSpacing: 3 }}>
            {sleeping ? formatTime(elapsed) : clock.display}
          </Text>
          <Text style={{ color: sleeping ? C.green : C.dim, fontSize: 11, marginTop: 4 }}>
            {sleeping ? `uyuyorsun — alarm: ${wakeTime}` : 'şu an'}
          </Text>
        </View>
      </View>

      {/* Uyku planı */}
      {!sleeping && (
        <View style={{ paddingHorizontal: 20, marginBottom: 10 }}>
          <Text style={styles.sectionTitle}>Kaç saat uyumak istiyorsun?</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
            {SLEEP_OPTIONS.map(h => (
              <TouchableOpacity
                key={h}
                style={[styles.goalBtn, selectedGoal === h && styles.goalBtnActive, { flex: 1 }]}
                onPress={() => setSelectedGoal(h)}
              >
                <Text style={[styles.goalText, selectedGoal === h && styles.goalTextActive]}>{h} sa</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={{
            backgroundColor: C.bg2, borderRadius: 14, paddingVertical: 12,
            paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-around',
            alignItems: 'center', borderWidth: 1, borderColor: C.bg3,
          }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: C.dim, fontSize: 10, marginBottom: 3 }}>ŞİMDİ YATSAN</Text>
              <Text style={{ color: C.white, fontSize: 20, fontWeight: '700' }}>{clock.display}</Text>
            </View>
            <Text style={{ color: C.border, fontSize: 18 }}>→</Text>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: C.dim, fontSize: 10, marginBottom: 3 }}>UYANIRSIN</Text>
              <Text style={{ color: C.green, fontSize: 20, fontWeight: '700' }}>{wakeTime}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Sesler */}
      <View style={{ paddingHorizontal: 20, marginBottom: 8 }}>
        <Text style={styles.sectionTitle}>Uyku sesleri</Text>
        <View style={styles.soundGrid}>
          {SOUND_LABELS.map(label => (
            <TouchableOpacity
              key={label}
              style={[styles.soundBtn, selectedSound === label && styles.soundBtnActive]}
              onPress={() => handleSoundSelect(label)}
            >
              <Text style={[styles.soundText, selectedSound === label && { color: C.accent }]}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={{ paddingHorizontal: 20, marginBottom: 6 }}>
        <Text style={{ color: C.dim, fontSize: 11, textAlign: 'center', fontStyle: 'italic' }}>
          Hiro, size iyi uykular diler 🌙
        </Text>
      </View>

      <View style={{ paddingHorizontal: 20, marginTop: 'auto', paddingBottom: 16 }}>
        <TouchableOpacity
          style={[styles.button, sleeping && { backgroundColor: '#1a3d2a', borderWidth: 1, borderColor: C.green }]}
          onPress={handleSleep}
        >
          <Text style={[styles.buttonText, sleeping && { color: C.green }]}>
            {sleeping ? `Bitir — Alarm: ${wakeTime}` : `Uyumaya Başla — Alarm: ${wakeTime}`}
          </Text>
        </TouchableOpacity>
      </View>

      <Modal visible={ratingModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Uyku nasıldı?</Text>
            <Text style={{ color: C.accentDim, textAlign: 'center', marginBottom: 24, fontSize: 14 }}>
              {formatTime(elapsed)} uyudun
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 28 }}>
              {[1, 2, 3, 4, 5].map(s => (
                <TouchableOpacity
                  key={s}
                  style={[styles.ratingBtn, s <= rating && styles.ratingBtnActive, { width: 52, height: 52 }]}
                  onPress={() => setRating(s)}
                >
                  <Text style={[styles.ratingText, { fontSize: 20 }]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={[styles.button, !rating && { opacity: 0.4 }]}
              onPress={handleSave}
              disabled={!rating}
            >
              <Text style={styles.buttonText}>Kaydet</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.buttonSecondary, { marginTop: 10 }]}
              onPress={() => { setRatingModal(false); setRating(0); }}
            >
              <Text style={[styles.buttonText, { color: C.accentDim }]}>Atla</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}