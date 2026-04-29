import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { getLogsForPeriod } from '../utils/storage';
import { getSleepQualityLabel } from '../utils/helpers';
import styles, { C } from '../styles';

const DAY_LABELS = { 0: 'Paz', 1: 'Pzt', 2: 'Sal', 3: 'Çar', 4: 'Per', 5: 'Cum', 6: 'Cmt' };

export default function StatsScreen() {
  const [activeTab, setActiveTab]   = React.useState('hafta');
  const [logs, setLogs]             = React.useState([]);
  const [loading, setLoading]       = React.useState(true);
  const [selectedLog, setSelected]  = React.useState(null);

  React.useEffect(() => { loadLogs(); }, [activeTab]);

  const loadLogs = async () => {
    setLoading(true);
    const data = await getLogsForPeriod(activeTab);
    setLogs(data);
    setLoading(false);
  };

  const avg    = logs.length ? (logs.reduce((s, l) => s + l.durationHours, 0) / logs.length).toFixed(1) : '—';
  const score  = logs.length ? Math.round(logs.reduce((s, l) => s + (l.rating || 3), 0) / logs.length * 20) : '—';
  const debt   = logs.length && avg !== '—' ? ((8 - parseFloat(avg)) * logs.length).toFixed(1) : '0';
  const maxLog = logs.length ? logs.reduce((a, b) => a.durationHours > b.durationHours ? a : b) : null;
  const minLog = logs.length ? logs.reduce((a, b) => a.durationHours < b.durationHours ? a : b) : null;

  const weekData = (() => {
    const map = {};
    logs.forEach(l => {
      const key = DAY_LABELS[new Date(l.date).getDay()];
      map[key] = (map[key] || 0) + l.durationHours;
    });
    return ['Pzt','Sal','Çar','Per','Cum','Cmt','Paz'].map(day => ({
      day,
      hours: parseFloat((map[day] || 0).toFixed(1)),
      color: (map[day] || 0) >= 7 ? C.green : (map[day] || 0) >= 5 ? C.accentDim : C.bg3,
    }));
  })();

  const maxH = Math.max(...weekData.map(d => d.hours), 8);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView contentContainerStyle={{ paddingTop: 52, paddingHorizontal: 20, paddingBottom: 40 }}>
        <Text style={styles.screenTitle}>İstatistikler</Text>

        {/* Özet kartlar */}
        <View style={styles.cardRow}>
          <View style={styles.statCard}>
            <Text style={styles.statVal}>{avg}</Text>
            <Text style={styles.statLbl}>Ort. saat</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statVal, { color: score !== '—' && score >= 75 ? C.green : score >= 55 ? C.amber : C.red }]}>{score}</Text>
            <Text style={styles.statLbl}>Uyku skoru</Text>
          </View>
        </View>

        <View style={styles.cardRow}>
          <View style={styles.statCard}>
            <Text style={[styles.statVal, { color: parseFloat(debt) > 0 ? C.amber : C.green }]}>
              {parseFloat(debt) > 0 ? `-${debt}` : '0'}
            </Text>
            <Text style={styles.statLbl}>Uyku borcu (sa)</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statVal}>{logs.length}</Text>
            <Text style={styles.statLbl}>Toplam kayıt</Text>
          </View>
        </View>

        {/* Dönem seçici */}
        <View style={styles.tabRow}>
          {['hafta', 'ay', 'yıl'].map(t => (
            <TouchableOpacity key={t} style={[styles.tabBtn, activeTab === t && styles.tabBtnActive]} onPress={() => setActiveTab(t)}>
              <Text style={[styles.tabText, activeTab === t && styles.tabTextActive]}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Bar chart */}
        {loading ? (
          <View style={[styles.barChart, { justifyContent: 'center' }]}>
            <Text style={{ color: C.accentDim }}>Yükleniyor...</Text>
          </View>
        ) : logs.length === 0 ? (
          <View style={[styles.card, { alignItems: 'center', paddingVertical: 32 }]}>
            <Text style={{ color: C.accentDim, fontSize: 13 }}>😴 Henüz uyku kaydı yok</Text>
            <Text style={{ color: C.dim, fontSize: 12, marginTop: 4 }}>Ana ekrandan uyku başlat</Text>
          </View>
        ) : (
          <View style={styles.barChart}>
            {weekData.map(item => (
              <View key={item.day} style={styles.barCol}>
                <Text style={styles.barHours}>{item.hours > 0 ? `${item.hours}` : ''}</Text>
                <View style={[styles.bar, { height: Math.max(4, (item.hours / maxH) * 110), backgroundColor: item.color }]} />
                <Text style={styles.barDay}>{item.day}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Özet */}
        {logs.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Dönem özeti</Text>
            {[
              { label: 'En uzun uyku', val: maxLog ? `${maxLog.durationHours} sa` : '—', color: C.green },
              { label: 'En kısa uyku', val: minLog ? `${minLog.durationHours} sa` : '—', color: C.red },
              { label: 'Ort. yatış',   val: (() => {
                const a = logs.reduce((s, l) => { const d = new Date(l.startTime); return s + d.getHours() * 60 + d.getMinutes(); }, 0) / logs.length;
                return `${String(Math.floor(a / 60)).padStart(2,'0')}:${String(Math.round(a % 60)).padStart(2,'0')}`;
              })(), color: C.accentDim },
            ].map((item, i) => (
              <View key={i} style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{item.label}</Text>
                <Text style={[styles.summaryVal, { color: item.color }]}>{item.val}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Son kayıtlar */}
        {logs.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Son kayıtlar</Text>
            {logs.slice(0, 5).map((log, i) => {
              const ql = getSleepQualityLabel(log.rating * 20);
              return (
                <TouchableOpacity key={i} style={styles.summaryRow} onPress={() => setSelected(log)}>
                  <View>
                    <Text style={{ color: C.white, fontSize: 13, fontWeight: '500' }}>
                      {new Date(log.date).toLocaleDateString('tr-TR')}
                    </Text>
                    <Text style={{ color: C.dim, fontSize: 11 }}>{log.quality || '—'}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ color: C.accentDim, fontSize: 13, fontWeight: '600' }}>{log.durationHours} saat</Text>
                    <Text style={{ color: ql.color, fontSize: 11 }}>{log.rating ? '★'.repeat(log.rating) : ''} {ql.label}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>💡 Öneri</Text>
          <Text style={styles.tipBody}>
            {score !== '—' && score < 60
              ? 'Uyku kalitenin artması için her gece aynı saatte yatmayı dene!'
              : 'Düzenli uyku alışkanlığın devam ediyor. 🎉'}
          </Text>
        </View>
      </ScrollView>

      {/* Detay modalı */}
      <Modal visible={!!selectedLog} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Uyku Detayı</Text>
            {selectedLog && [
              { label: 'Tarih',  val: new Date(selectedLog.date).toLocaleDateString('tr-TR'), color: C.accentDim },
              { label: 'Süre',   val: `${selectedLog.durationHours} saat`, color: C.green },
              { label: 'Puan',   val: '★'.repeat(selectedLog.rating || 3), color: C.amber },
              { label: 'Kalite', val: selectedLog.quality || '—', color: C.accentDim },
              { label: 'Ses',    val: selectedLog.sound || '—', color: C.accentDim },
            ].map((item, i) => (
              <View key={i} style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{item.label}</Text>
                <Text style={[styles.summaryVal, { color: item.color }]}>{item.val}</Text>
              </View>
            ))}
            <TouchableOpacity style={[styles.button, { marginTop: 20 }]} onPress={() => setSelected(null)}>
              <Text style={styles.buttonText}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}