import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Modal, TextInput } from 'react-native';
import { formatTime } from '../utils/helpers';
import { saveBabyLog, getTodayBabyLogs } from '../utils/storage';
import styles, { C } from '../styles';

const PRESETS = [
  { age: '0-3 ay',  total: '14-17', night: '8-9',   naps: '4-5 kez' },
  { age: '4-11 ay', total: '12-15', night: '9-10',  naps: '2-3 kez' },
  { age: '1-2 yaş', total: '11-14', night: '10-11', naps: '1-2 kez' },
  { age: '3-5 yaş', total: '10-13', night: '10-11', naps: '0-1 kez' },
];

export default function BabyScreen() {
  const [tracking, setTracking]       = React.useState(false);
  const [elapsed, setElapsed]         = React.useState(0);
  const [sleepLog, setSleepLog]       = React.useState([]);
  const [babyName, setBabyName]       = React.useState('Bebek');
  const [babyAge, setBabyAge]         = React.useState('6 aylık');
  const [editModal, setEditModal]     = React.useState(false);
  const [tempName, setTempName]       = React.useState('');
  const [tempAge, setTempAge]         = React.useState('');
  const [selectedPreset, setPreset]   = React.useState(1);
  const sleepStart = React.useRef(null);

  React.useEffect(() => { loadLogs(); }, []);

  React.useEffect(() => {
    let iv;
    if (tracking) iv = setInterval(() => setElapsed(p => p + 1), 1000);
    return () => clearInterval(iv);
  }, [tracking]);

  const loadLogs = async () => {
    const logs = await getTodayBabyLogs();
    setSleepLog(logs);
  };

  const totalToday = sleepLog.reduce((s, l) => l.type === 'sleep' ? s + (l.durationSecs || 0) : s, 0);
  const preset = PRESETS[selectedPreset];
  const recommended = parseInt(preset.total.split('-')[0]);
  const healthy = Math.floor(totalToday / 3600) >= recommended * 0.7;

  const handleStartStop = async () => {
    if (!tracking) {
      sleepStart.current = new Date();
      setElapsed(0);
      setTracking(true);
    } else {
      setTracking(false);
      const log = {
        type: 'sleep',
        startTime: sleepStart.current.toISOString(),
        endTime: new Date().toISOString(),
        durationSecs: elapsed,
        label: elapsed < 3600 ? 'Kısa uyku' : elapsed < 7200 ? 'Gündüz uykusu' : 'Uzun uyku',
      };
      await saveBabyLog(log);
      setSleepLog(p => [log, ...p]);
      Alert.alert('Uyku bitti', `${babyName} ${formatTime(elapsed)} uyudu.`, [{ text: 'Tamam' }]);
      setElapsed(0);
    }
  };

  const th = Math.floor(totalToday / 3600);
  const tm = Math.floor((totalToday % 3600) / 60);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView contentContainerStyle={{ paddingTop: 52, paddingHorizontal: 20, paddingBottom: 24 }}>
        <Text style={styles.screenTitle}>Bebek Takibi</Text>

        {/* Bebek kartı */}
        <TouchableOpacity style={styles.card} onPress={() => { setTempName(babyName); setTempAge(babyAge); setEditModal(true); }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={styles.cardTitle}>{babyName} · {babyAge}</Text>
              <Text style={styles.timeLbl}>Önerilen: {preset.total} saat/gün</Text>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 6 }}>
              <View style={{ backgroundColor: healthy ? '#1a3d2a' : '#3d1a1a', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}>
                <Text style={{ color: healthy ? C.green : C.red, fontSize: 12, fontWeight: '600' }}>
                  {healthy ? 'Sağlıklı' : 'Az uyku'}
                </Text>
              </View>
              <Text style={{ color: C.dim, fontSize: 11 }}>düzenle</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Aktif sayaç */}
        {tracking && (
          <View style={[styles.card, { alignItems: 'center', borderWidth: 1, borderColor: C.bg4 }]}>
            <Text style={styles.timeLbl}>Uyuyor</Text>
            <Text style={[styles.bigTime, { marginTop: 4 }]}>{formatTime(elapsed)}</Text>
          </View>
        )}

        {/* Günlük özet */}
        <View style={styles.card}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={styles.timeLbl}>Bugün toplam</Text>
            <Text style={[styles.statVal, { fontSize: 22, color: healthy ? C.green : C.amber }]}>{th} sa {tm} dk</Text>
          </View>
          <View style={{ marginTop: 10, height: 5, backgroundColor: C.bg, borderRadius: 3 }}>
            <View style={{ height: 5, borderRadius: 3, backgroundColor: healthy ? C.green : C.amber, width: `${Math.min((totalToday / (recommended * 3600)) * 100, 100)}%` }} />
          </View>
          <Text style={[styles.timeLbl, { marginTop: 4 }]}>Hedef: {preset.total} saat</Text>
        </View>

        {/* Yaş grupları */}
        <Text style={styles.sectionTitle}>Yaş grubuna göre uyku rehberi</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {PRESETS.map((p, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.card, { minWidth: 130, marginBottom: 0, borderWidth: 1, borderColor: selectedPreset === i ? C.bg4 : C.bg3 }]}
                onPress={() => setPreset(i)}
              >
                <Text style={[styles.cardTitle, { fontSize: 12, marginBottom: 6, color: selectedPreset === i ? C.accent : C.white }]}>{p.age}</Text>
                <Text style={styles.timeLbl}>Toplam: {p.total} sa</Text>
                <Text style={styles.timeLbl}>Gece: {p.night} sa</Text>
                <Text style={styles.timeLbl}>Gündüz: {p.naps}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Uyku geçmişi */}
        <Text style={styles.sectionTitle}>Bugünkü uyku geçmişi</Text>
        {sleepLog.length === 0 ? (
          <View style={[styles.card, { alignItems: 'center', paddingVertical: 20 }]}>
            <Text style={{ color: C.dim, fontSize: 13 }}>Henüz kayıt yok</Text>
          </View>
        ) : sleepLog.map((item, i) => {
          const s = new Date(item.startTime);
          const e = item.endTime ? new Date(item.endTime) : null;
          const t = e
            ? `${s.getHours()}:${String(s.getMinutes()).padStart(2,'0')} — ${e.getHours()}:${String(e.getMinutes()).padStart(2,'0')}`
            : `${s.getHours()}:${String(s.getMinutes()).padStart(2,'0')} — devam ediyor`;
          return (
            <View key={i} style={styles.babyEntry}>
              <View style={[styles.babyDot, { backgroundColor: C.bg4, marginTop: 6 }]} />
              <View>
                <Text style={styles.babyTime}>{t}</Text>
                <Text style={styles.timeLbl}>{item.durationSecs ? formatTime(item.durationSecs) : '...'} · {item.label}</Text>
              </View>
            </View>
          );
        })}

        <View style={[styles.tipCard, { marginTop: 12 }]}>
          <Text style={styles.tipTitle}>📋 {preset.age} Uyku Rehberi</Text>
          <Text style={styles.tipBody}>
            • Toplam: {preset.total} saat{'\n'}
            • Gece: {preset.night} saat{'\n'}
            • Gündüz: {preset.naps}{'\n'}
            • Düzenli rutin oluşturmaya başlayın
          </Text>
        </View>
      </ScrollView>

      {/* Sabit buton */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 16, backgroundColor: C.bg }}>
        <TouchableOpacity
          style={[styles.button, tracking && { backgroundColor: '#1a3d2a', borderWidth: 1, borderColor: C.green }]}
          onPress={handleStartStop}
        >
          <Text style={[styles.buttonText, tracking && { color: C.green }]}>
            {tracking ? '⏹ Uykuyu bitir' : '🍼 Uyku başlat'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Düzenleme modalı */}
      <Modal visible={editModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Bebek Bilgileri</Text>
            <TextInput
              style={[styles.input, { marginBottom: 12 }]}
              placeholder="Bebeğin adı"
              placeholderTextColor={C.dim}
              value={tempName}
              onChangeText={setTempName}
            />
            <TextInput
              style={[styles.input, { marginBottom: 20 }]}
              placeholder="Yaşı (örn: 6 aylık)"
              placeholderTextColor={C.dim}
              value={tempAge}
              onChangeText={setTempAge}
            />
            <TouchableOpacity style={styles.button} onPress={() => {
              if (tempName.trim()) setBabyName(tempName.trim());
              if (tempAge.trim()) setBabyAge(tempAge.trim());
              setEditModal(false);
            }}>
              <Text style={styles.buttonText}>Kaydet</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.buttonSecondary, { marginTop: 10 }]} onPress={() => setEditModal(false)}>
              <Text style={[styles.buttonText, { color: C.accentDim }]}>Vazgeç</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}