import React from 'react';
import { View, Text, TouchableOpacity, Alert, Modal } from 'react-native';
import { Audio } from 'expo-av';
import { formatTime, calcWakeTime, getCurrentTime, getDayName, getDateString } from '../utils/helpers';
import { saveSleepLog } from '../utils/storage';
import styles, { C } from '../styles';

const SLEEP_OPTIONS = [6, 7, 8, 9];

const SOUNDS = [
  { label: '🌧 Yağmur',    file: require('../../assets/sounds/rain.mp3') },
  { label: '🌊 Okyanus',   file: require('../../assets/sounds/waves.mp3') },
  { label: '🔥 Ateş',      file: require('../../assets/sounds/fire.mp3') },
  { label: '🍃 Rüzgar',    file: require('../../assets/sounds/wind.mp3') },
  { label: '🎵 Beyaz ses', file: require('../../assets/sounds/white noise.mp3') },
  { label: '🌙 Sessizlik', file: null },
];

export default function HomeScreen() {
  const [sleeping, setSleeping]       = React.useState(false);
  const [elapsed, setElapsed]         = React.useState(0);
  const [selectedSound, setSelected]  = React.useState(null);
  const [ratingModal, setRatingModal] = React.useState(false);
  const [rating, setRating]           = React.useState(0);
  const [clock, setClock]             = React.useState(getCurrentTime());
  const sleepStart = React.useRef(null);
  const soundRef   = React.useRef(null);

  const now = new Date();
  const wakeOptions = SLEEP_OPTIONS.map(h => ({
    h, time: calcWakeTime(now.getHours(), now.getMinutes(), h),
  }));

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
    Audio.setAudioModeAsync({ playsInSilentModeIOS: true, staysActiveInBackground: true });
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
      const { sound } = await Audio.Sound.createAsync(file, { isLooping: true, shouldPlay: true });
      soundRef.current = sound;
    } catch (e) {}
  };

  const handleSoundSelect = async (s) => {
    setSelected(s.label);
    if (sleeping) await playSound(s.file);
  };

  const handleSleep = async () => {
    if (!sleeping) {
      sleepStart.current = new Date();
      setElapsed(0);
      setSleeping(true);
      const sel = SOUNDS.find(s => s.label === selectedSound);
      if (sel?.file) await playSound(sel.file);
    } else {
      setSleeping(false);
      await stopSound();
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
    <View style={{ flex: 1, backgroundColor: C.bg, paddingTop: 52 }}>

      {/* Başlık */}
      <View style={{ alignItems: 'center', marginBottom: 12 }}>
        <Text style={styles.title}>SLEEPWAVE</Text>
        <Text style={styles.dateText}>{getDayName()}, {getDateString()}</Text>
      </View>

      {/* Çember */}
      <View style={{ alignItems: 'center', marginBottom: 16 }}>
        <View style={[
          styles.circle,
          sleeping && { borderColor: C.green },
          { width: 190, height: 190, borderRadius: 95 },
        ]}>
          <Text style={{ fontSize: sleeping ? 26 : 44, fontWeight: '700', color: C.white, letterSpacing: 2 }}>
            {sleeping ? formatTime(elapsed) : clock.display}
          </Text>
          <Text style={styles.circleLabel}>
            {sleeping ? 'uyuyorsun' : 'şu an'}
          </Text>
        </View>
      </View>

      {/* Uyanış kartları */}
      {!sleeping && (
        <View style={{ paddingHorizontal: 20, marginBottom: 14 }}>
          <Text style={styles.sectionTitle}>Şimdi yatsan kaçta uyanırsın</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {wakeOptions.map(opt => (
              <View key={opt.h} style={styles.wakeCard}>
                <Text style={styles.wakeHour}>{opt.h} saat</Text>
                <Text style={styles.wakeTime}>{opt.time}</Text>
                <Text style={styles.wakeLabel}>uyanış</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Sesler */}
      <View style={{ paddingHorizontal: 20, marginBottom: 14 }}>
        <Text style={styles.sectionTitle}>Uyku sesleri</Text>
        <View style={styles.soundGrid}>
          {SOUNDS.map(s => (
            <TouchableOpacity
              key={s.label}
              style={[styles.soundBtn, selectedSound === s.label && styles.soundBtnActive]}
              onPress={() => handleSoundSelect(s)}
            >
              <Text style={[styles.soundText, selectedSound === s.label && { color: C.accent }]}>
                {s.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Admin notu */}
      <View style={{ paddingHorizontal: 20, marginBottom: 8 }}>
        <Text style={{ color: C.dim, fontSize: 12, textAlign: 'center', fontStyle: 'italic', letterSpacing: 0.5 }}>
          Hiro, size iyi uykular diler 🌙
        </Text>
      </View>

      {/* Buton */}
      <View style={{ paddingHorizontal: 20, marginTop: 'auto', paddingBottom: 16 }}>
        <TouchableOpacity
          style={[styles.button, sleeping && { backgroundColor: '#1a3d2a', borderWidth: 1, borderColor: C.green }]}
          onPress={handleSleep}
        >
          <Text style={[styles.buttonText, sleeping && { color: C.green }]}>
            {sleeping ? 'Bitir' : 'Uyumaya Başla'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Rating Modal */}
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