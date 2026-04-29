import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, TextInput } from 'react-native';
import * as Notifications from 'expo-notifications';
import { calcWakeTime, getCurrentTime } from '../utils/helpers';
import styles, { C } from '../styles';

const GOALS = [6, 7, 8, 9];

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function AlarmScreen() {
  const [selectedGoal, setSelectedGoal] = React.useState(8);
  const [alarmSet, setAlarmSet]         = React.useState(false);
  const [alarmId, setAlarmId]           = React.useState(null);
  const [bedHour, setBedHour]           = React.useState(null);
  const [bedMin, setBedMin]             = React.useState(null);
  const [manualHour, setManualHour]     = React.useState('');
  const [manualMin, setManualMin]       = React.useState('');
  const [editMode, setEditMode]         = React.useState(false);

  React.useEffect(() => {
    const c = getCurrentTime();
    setBedHour(c.hour);
    setBedMin(c.min);
    setManualHour(String(c.hour).padStart(2, '0'));
    setManualMin(String(c.min).padStart(2, '0'));
    requestPermission();
  }, []);

  const requestPermission = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('İzin gerekli', 'Alarm için bildirim izni gerekiyor.');
    }
  };

  const h = bedHour ?? 23;
  const m = bedMin ?? 0;
  const wakeTime = calcWakeTime(h, m, selectedGoal);

  const adjustHour = (d) => {
    const nh = (h + d + 24) % 24;
    setBedHour(nh);
    setManualHour(String(nh).padStart(2, '0'));
  };

  const adjustMin = (d) => {
    let nm = m + d;
    let nh = h;
    if (nm >= 60) { nm -= 60; nh = (nh + 1) % 24; }
    if (nm < 0)   { nm += 60; nh = (nh - 1 + 24) % 24; }
    setBedHour(nh);
    setBedMin(nm);
    setManualHour(String(nh).padStart(2, '0'));
    setManualMin(String(nm).padStart(2, '0'));
  };

  const handleManualSave = () => {
    const ph = parseInt(manualHour);
    const pm = parseInt(manualMin);
    if (!isNaN(ph) && !isNaN(pm) && ph >= 0 && ph <= 23 && pm >= 0 && pm <= 59) {
      setBedHour(ph);
      setBedMin(pm);
      setEditMode(false);
    } else {
      Alert.alert('Geçersiz saat', 'Saat 00-23, dakika 00-59 arasında olmalı.');
    }
  };

  const scheduleAlarm = async () => {
    const [wh, wm] = wakeTime.split(':').map(Number);
    const now = new Date();
    const alarmDate = new Date();
    alarmDate.setHours(wh, wm, 0, 0);
    if (alarmDate <= now) alarmDate.setDate(alarmDate.getDate() + 1);
    const seconds = Math.floor((alarmDate - now) / 1000);
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: '⏰ Uyanma Zamanı!',
        body: `${selectedGoal} saat uyudun. Günaydın! 🌅`,
        sound: true,
      },
      trigger: { seconds },
    });
    return id;
  };

  const handleAlarm = async () => {
    if (!alarmSet) {
      try {
        const id = await scheduleAlarm();
        setAlarmId(id);
        setAlarmSet(true);
        Alert.alert('Alarm kuruldu! ⏰', `${wakeTime}'da seni uyandıracağım.`, [{ text: 'Tamam' }]);
      } catch (e) {
        Alert.alert('Hata', 'Alarm kurulamadı: ' + e.message);
      }
    } else {
      if (alarmId) await Notifications.cancelScheduledNotificationAsync(alarmId);
      setAlarmId(null);
      setAlarmSet(false);
      Alert.alert('Alarm iptal edildi', '', [{ text: 'Tamam' }]);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView contentContainerStyle={{ paddingTop: 52, paddingHorizontal: 20, paddingBottom: 24 }}>
        <Text style={styles.screenTitle}>Alarm</Text>

        {/* Yatış saati kartı */}
        <View style={styles.card}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <Text style={styles.cardTitle}>Yatış saati</Text>
            <TouchableOpacity onPress={() => setEditMode(!editMode)}>
              <Text style={{ color: C.accentDim, fontSize: 12 }}>
                {editMode ? 'Vazgeç' : 'Manuel gir'}
              </Text>
            </TouchableOpacity>
          </View>

          {editMode ? (
            <View style={{ alignItems: 'center', gap: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8 }}>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: C.accentDim, fontSize: 11, marginBottom: 6 }}>SAAT</Text>
                  <TextInput
                    style={[styles.input, { width: 80, fontSize: 28, fontWeight: '700', textAlign: 'center', padding: 10 }]}
                    value={manualHour}
                    onChangeText={setManualHour}
                    keyboardType="number-pad"
                    maxLength={2}
                    placeholder="00"
                    placeholderTextColor={C.dim}
                  />
                </View>
                <Text style={{ color: C.accentDim, fontSize: 28, fontWeight: '700', marginBottom: 8 }}>:</Text>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: C.accentDim, fontSize: 11, marginBottom: 6 }}>DAKİKA</Text>
                  <TextInput
                    style={[styles.input, { width: 80, fontSize: 28, fontWeight: '700', textAlign: 'center', padding: 10 }]}
                    value={manualMin}
                    onChangeText={setManualMin}
                    keyboardType="number-pad"
                    maxLength={2}
                    placeholder="00"
                    placeholderTextColor={C.dim}
                  />
                </View>
              </View>
              <TouchableOpacity style={styles.button} onPress={handleManualSave}>
                <Text style={styles.buttonText}>Onayla</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ alignItems: 'center', gap: 20 }}>

              {/* Büyük saat */}
              <Text style={{ fontSize: 72, fontWeight: '700', color: C.white, letterSpacing: 6 }}>
                {String(h).padStart(2, '0')}:{String(m).padStart(2, '0')}
              </Text>

              {/* Saat butonları */}
              <View style={{ width: '100%' }}>
                <Text style={{ color: C.accentDim, fontSize: 11, letterSpacing: 1, textAlign: 'center', marginBottom: 10 }}>SAAT</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 16 }}>
                  <TouchableOpacity
                    style={{ backgroundColor: C.bg3, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 12 }}
                    onPress={() => adjustHour(-1)}
                  >
                    <Text style={{ color: C.accent, fontSize: 22, fontWeight: '600' }}>−</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ backgroundColor: C.bg3, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 12 }}
                    onPress={() => adjustHour(1)}
                  >
                    <Text style={{ color: C.accent, fontSize: 22, fontWeight: '600' }}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Dakika butonları */}
              <View style={{ width: '100%' }}>
                <Text style={{ color: C.accentDim, fontSize: 11, letterSpacing: 1, textAlign: 'center', marginBottom: 10 }}>DAKİKA</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
                  {[-15, -5, -1, 1, 5, 15].map(v => (
                    <TouchableOpacity
                      key={v}
                      style={{ backgroundColor: C.bg3, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12 }}
                      onPress={() => adjustMin(v)}
                    >
                      <Text style={{ color: C.accentDim, fontSize: 13, fontWeight: '500' }}>
                        {v > 0 ? `+${v}` : `${v}`}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Kaç saat */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Kaç saat uyumak istiyorsun?</Text>
          <View style={styles.goalRow}>
            {GOALS.map(g => (
              <TouchableOpacity
                key={g}
                style={[styles.goalBtn, selectedGoal === g && styles.goalBtnActive]}
                onPress={() => setSelectedGoal(g)}
              >
                <Text style={[styles.goalText, selectedGoal === g && styles.goalTextActive]}>
                  {g} saat
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Uyku planı */}
        <View style={[styles.card, { alignItems: 'center' }]}>
          <Text style={styles.cardTitle}>Uyku planı</Text>
          <View style={styles.timeRow}>
            <View style={styles.timeBox}>
              <Text style={styles.bigTime}>{String(h).padStart(2, '0')}:{String(m).padStart(2, '0')}</Text>
              <Text style={styles.timeLbl}>Yatış</Text>
            </View>
            <Text style={styles.timeArrow}>→</Text>
            <View style={styles.timeBox}>
              <Text style={[styles.bigTime, { color: C.green }]}>{wakeTime}</Text>
              <Text style={styles.timeLbl}>Kalkış</Text>
            </View>
          </View>
          {alarmSet && (
            <View style={{ backgroundColor: '#1a3d2a', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 6, marginTop: 8 }}>
              <Text style={{ color: C.green, fontSize: 13, fontWeight: '600' }}>✓ Alarm kuruldu — {wakeTime}</Text>
            </View>
          )}
        </View>

        {/* İpuçları */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Uyku ipuçları</Text>
          {[
            { icon: '📵', tip: 'Yatmadan 1 saat önce ekran kapatın' },
            { icon: '🌡️', tip: 'Oda sıcaklığını 18-20°C tutun' },
            { icon: '☕',  tip: 'Öğleden sonra kafein almaktan kaçının' },
            { icon: '🧘',  tip: '4-7-8 nefes tekniğini deneyin' },
            { icon: '🛁',  tip: 'Yatmadan önce ılık duş alın' },
            { icon: '📖',  tip: 'Kitap okumak uykuya dalmayı kolaylaştırır' },
          ].map((item, i) => (
            <View key={i} style={styles.tipRow}>
              <Text style={styles.tipIcon}>{item.icon}</Text>
              <Text style={styles.tipRowText}>{item.tip}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={{ paddingHorizontal: 20, paddingBottom: 16, backgroundColor: C.bg }}>
        <TouchableOpacity
          style={[styles.button, alarmSet && { backgroundColor: '#1a3d2a', borderWidth: 1, borderColor: C.green }]}
          onPress={handleAlarm}
        >
          <Text style={[styles.buttonText, alarmSet && { color: C.green }]}>
            {alarmSet ? '✓ Alarm kuruldu — iptal et' : '⏰ Alarm kur'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}