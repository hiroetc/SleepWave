import React from 'react';
import { View, Text, TouchableOpacity, Alert, Modal } from 'react-native';
import { Audio } from 'expo-av';
import * as Notifications from 'expo-notifications';
import { formatTime, calcWakeTime, getCurrentTime, getDayName, getDateString } from '../utils/helpers';
import { saveSleepLog } from '../utils/storage';
import styles, { C } from '../styles';

const SLEEP_OPTIONS = [6, 7, 8, 9];
const SOUNDS = [
  { label: '🌧 Yağmur',    file: require('../../assets/sounds/rain.mp3') },
  { label: '🌊 Okyanus',   file: require('../../assets/sounds/waves.mp3') },
  { label: '🔥 Ateş',      file: require('../../assets/sounds/fire.mp3') },
  { label: '🍃 Rüzgar',    file: require('../../assets/sounds/wind.mp3') },
  { label: '🎵 Beyaz ses', file: require('../../assets/sounds/white_noise.mp3') },
  { label: '🌙 Sessizlik', file: null },
];

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowAlert: true, shouldPlaySound: true, shouldSetBadge: false }),
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
  const sleepStart = React.useRef(null);
  const soundRef   = React.useRef(null);

  const now = new Date();
  const wakeTime = calcWakeTime(now.getHours(), now.getMinutes(), selectedGoal);

  React.useEffect(() => {
    const t = setInterval(() => setClock(getCurrentTime()), 1000);
    return () => clearInterval(t);
  }, []);

  React.useEffect(() => {
    let iv;
    if (sleeping) iv = setInterval(() => setElapsed(p => p + 1), 1000);
    return () => clearInterval(iv);
  }, [sleeping]);

  React.useEffect(() => {
    Audio.setAudioModeAsync({ playsInSilentModeIOS: true, staysActiveInBackground: true, shouldDuckAndroid: false });
    Notifications.requestPermissionsAsync();
  }, []);

  const stopSound = async () => {
    if (soundRef.current) {
      try { await soundRef.current.stopAsync(); await soundRef.current.unloadAsync(); } catch (_) {}
      soundRef.current = null;
    }
  };

  const playSound = async (file) => {
    await stopSound();
    if (!file) return;
    try {
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true, staysActiveInBackground: true, shouldDuckAndroid: false });
      const { sound } = await Audio.Sound.createAsync(file, { isLooping: true, shouldPlay: true, volume: 1.0 });
      soundRef.current = sound;
      await soundRef.current.playAsync();
    } catch (e) { console.log('Ses:', e); }
  };

  const handleSoundSelect = async (s) => {
    setSelected(s.label);
    await playSound(s.file);
  };

  const handleSleep = async () => {
    if (!sleeping) {
      sleepStart.current = new Date();
      setElapsed(0);
      setSleeping(true);
      const sel = SOUNDS.find(s => s.label === selectedSound);
      if (sel?.file) await playSound(sel.file);
      try {
        const id = await Notifications.scheduleNotificationAsync({
          content: { title: '⏰ Uyanma Zamanı!', body: `${selectedGoal} saat uyudun. Günaydın! 🌅`, sound: true },
          trigger: { seconds: selectedGoal * 60 * 60 },
        });
        setAlarmId(id);
      } catch (e) { console.log('Alarm:', e); }
    } else {
      setSleeping(false);
      await stopSound();
      if (alarmId) { await Notifications.cancelScheduledNotificationAsync(alarmId); setAlarmId(null); }
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
        <View style={{ backgroundColor: C.bg2, borderRadius: 20, paddingVertical: 16, paddingHorizontal: 24, borderWidth: 1, borderColor: sleeping ? C.green : C.bg3, alignItems: 'center' }}>
          <Text style={{ color: C.dim, fontSize: 11, letterSpacing: 1, marginBottom: 4 }}>
            {getDayName().toUpperCase()}, {getDateString()}
          </Text>
          <Text style={{ fontSize: sleeping ? 32 : 52, fontWeight: '700', color: C.white, letterSpacing: 3 }}>
            {sleeping ? formatTime(elapsed) : clock.display}
          </Text>
          <Text style={{ color: sleeping ? C.green : C.dim, fontSize: 11, marginTop: 4 }}>
            {sleeping ? 'uyuyorsun' : 'şu an'}
          </Text>
        </View>
      </View>

      {/* Uyku planı */}
      {!sleeping && (
        <View style={{ paddingHorizontal: 20, marginBottom: 10 }}>
          <Text style={styles.sectionTitle}>Kaç saat uyumak istiyorsun?</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
            {SLEEP_OPTIONS.map(h => (
              <TouchableOpacity key={h} style={[styles.goalBtn, selectedGoal === h && styles.goalBtnActive, { flex: 1 }]} onPress={() => setSelectedGoal(h)}>
                <Text style={[styles.goalText, selectedGoal === h && styles.goalTextActive]}>{h} sa</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={{ backgroundColor: C.bg2, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', borderWidth: 1, borderColor: C.bg3 }}>
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
          {SOUNDS.map(s => (
            <TouchableOpacity key={s.label} style={[styles.soundBtn, selectedSound === s.label && styles.soundBtnActive]} onPress={() => handleSoundSelect(s)}>
              <Text style={[styles.soundText, selectedSound === s.label && { color: C.accent }]}>{s.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={{ paddingHorizontal: 20, marginBottom: 6 }}>
        <Text style={{ color: C.dim, fontSize: 11, textAlign: 'center', fontStyle: 'italic' }}>Hiro, size iyi uykular diler 🌙</Text>
      </View>

      <View style={{ paddingHorizontal: 20, marginTop: 'auto', paddingBottom: 16 }}>
        <TouchableOpacity style={[styles.button, sleeping && { backgroundColor: '#1a3d2a', borderWidth: 1, borderColor: C.green }]} onPress={handleSleep}>
          <Text style={[styles.buttonText, sleeping && { color: C.green }]}>
            {sleeping ? `Bitir — Alarm: ${wakeTime}` : `Uyumaya Başla — Alarm: ${wakeTime}`}
          </Text>
        </TouchableOpacity>
      </View>

      <Modal visible={ratingModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Uyku nasıldı?</Text>
            <Text style={{ color: C.accentDim, textAlign: 'center', marginBottom: 24, fontSize: 14 }}>{formatTime(elapsed)} uyudun</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 28 }}>
              {[1, 2, 3, 4, 5].map(s => (
                <TouchableOpacity key={s} style={[styles.ratingBtn, s <= rating && styles.ratingBtnActive, { width: 52, height: 52 }]} onPress={() => setRating(s)}>
                  <Text style={[styles.ratingText, { fontSize: 20 }]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={[styles.button, !rating && { opacity: 0.4 }]} onPress={handleSave} disabled={!rating}>
              <Text style={styles.buttonText}>Kaydet</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.buttonSecondary, { marginTop: 10 }]} onPress={() => { setRatingModal(false); setRating(0); }}>
              <Text style={[styles.buttonText, { color: C.accentDim }]}>Atla</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}