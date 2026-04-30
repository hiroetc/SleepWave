import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { getLogsForPeriod } from '../utils/storage';
import { getSleepQualityLabel } from '../utils/helpers';
import styles, { C } from '../styles';

const DAY_LABELS = { 0: 'Paz', 1: 'Pzt', 2: 'Sal', 3: 'Çar', 4: 'Per', 5: 'Cum', 6: 'Cmt' };
const MONTHS = ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'];

const TIPS = [
  { icon: '📵', title: 'Ekran kapatın', body: 'Yatmadan 1 saat önce telefon ve bilgisayar ekranlarını kapatın. Mavi ışık melatonin üretimini engeller.' },
  { icon: '🌡️', title: 'Oda sıcaklığı', body: 'Oda sıcaklığını 18-20°C arasında tutun. Serin ortam daha derin uyku sağlar.' },
  { icon: '☕',  title: 'Kafein', body: 'Öğleden sonra kahve, çay ve enerji içeceklerinden kaçının. Kafein 6 saate kadar etkili olabilir.' },
  { icon: '🧘', title: '4-7-8 Nefes', body: '4 saniye nefes al, 7 saniye tut, 8 saniyede ver. Bu teknik sinir sistemini sakinleştirir.' },
  { icon: '🛁', title: 'Ilık duş', body: 'Yatmadan 1-2 saat önce ılık duş almak vücut ısısını düşürerek uykuya dalmayı kolaylaştırır.' },
  { icon: '⏰', title: 'Düzenli uyku', body: 'Her gün aynı saatte yatıp kalkmak biyolojik saatinizi düzenler ve uyku kalitesini artırır.' },
  { icon: '🌙', title: 'Karanlık ortam', body: 'Uyku sırasında odanın tamamen karanlık olması melatonin üretimini destekler.' },
  { icon: '📖', title: 'Kitap okuyun', body: 'Yatmadan önce kitap okumak zihni sakinleştirip uykuya geçişi kolaylaştırır.' },
];

export default function StatsScreen() {
  const [activeTab, setActiveTab]  = React.useState('hafta');
  const [logs, setLogs]            = React.useState([]);
  const [loading, setLoading]      = React.useState(true);
  const [selectedLog, setSelected] = React.useState(null);
  const [tipIndex, setTipIndex]    = React.useState(0);

  React.useEffect(() => { loadLogs(); }, [activeTab]);

  const loadLogs = async () => {
    setLoading(true);
    const data = await getLogsForPeriod(activeTab);
    setLogs(data);
    setLoading(false);
  };

  const avg   = logs.length ? (logs.reduce((s, l) => s + l.durationHours, 0) / logs.length).toFixed(1) : '—';
  const score = logs.length ? Math.round(logs.reduce((s, l) => s + (l.rating || 3), 0) / logs.length * 20) : '—';
  const total = logs.length ? logs.reduce((s, l) => s + l.durationHours, 0).toFixed(1) : '0';
  const consistency = logs.length >= 3 ? (() => {
    const hours = logs.map(l => l.durationHours);
    const mean = hours.reduce((a, b) => a + b, 0) / hours.length;
    const std  = Math.sqrt(hours.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / hours.length);
    return std < 0.5 ? 'Çok iyi' : std < 1 ? 'İyi' : std < 1.5 ? 'Orta' : 'Düzensiz';
  })() : '—';

  const maxLog = logs.length ? logs.reduce((a, b) => a.durationHours > b.durationHours ? a : b) : null;
  const minLog = logs.length ? logs.reduce((a, b) => a.durationHours < b.durationHours ? a : b) : null;

  const chartData = (() => {
    if (activeTab === 'hafta') {
      const map = {};
      logs.forEach(l => { const k = DAY_LABELS[new Date(l.date).getDay()]; map[k] = (map[k] || 0) + l.durationHours; });
      return ['Pzt','Sal','Çar','Per','Cum','Cmt','Paz'].map(day => ({
        day, hours: parseFloat((map[day] || 0).toFixed(1)),
        color: (map[day]||0) >= 7 ? C.green : (map[day]||0) >= 5 ? C.accentDim : C.bg3,
      }));
    }
    if (activeTab === 'ay') {
      const map = {};
      logs.forEach(l => { const d = new Date(l.date); const k = `${d.getDate()}`; map[k] = (map[k] || 0) + l.durationHours; });
      return Object.entries(map).sort((a,b) => parseInt(a[0])-parseInt(b[0])).slice(-10).map(([day, hours]) => ({
        day, hours: parseFloat(hours.toFixed(1)), color: hours >= 7 ? C.green : hours >= 5 ? C.accentDim : C.bg3,
      }));
    }
    if (activeTab === 'yıl') {
      const map = {};
      logs.forEach(l => { const d = new Date(l.date); const k = MONTHS[d.getMonth()]; if (!map[k]) map[k] = {t:0,c:0}; map[k].t += l.durationHours; map[k].c++; });
      return Object.entries(map).map(([day, v]) => ({
        day, hours: parseFloat((v.t/v.c).toFixed(1)), color: (v.t/v.c) >= 7 ? C.green : (v.t/v.c) >= 5 ? C.accentDim : C.bg3,
      }));
    }
    return [];
  })();

  const maxH = Math.max(...chartData.map(d => d.hours), 8);
  const tip  = TIPS[tipIndex];

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView contentContainerStyle={{ paddingTop: 52, paddingHorizontal: 20, paddingBottom: 40 }}>
        <Text style={styles.screenTitle}>İstatistikler</Text>

        <View style={styles.cardRow}>
          <View style={styles.statCard}><Text style={styles.statVal}>{avg}</Text><Text style={styles.statLbl}>Ort. uyku (sa)</Text></View>
          <View style={styles.statCard}>
            <Text style={[styles.statVal, { color: score!=='—' && score>=75 ? C.green : score>=55 ? C.amber : C.red }]}>{score}</Text>
            <Text style={styles.statLbl}>Uyku skoru</Text>
          </View>
        </View>
        <View style={styles.cardRow}>
          <View style={styles.statCard}><Text style={styles.statVal}>{total}</Text><Text style={styles.statLbl}>Toplam (sa)</Text></View>
          <View style={styles.statCard}><Text style={[styles.statVal, { fontSize: 18 }]}>{consistency}</Text><Text style={styles.statLbl}>Düzenlilik</Text></View>
        </View>

        <View style={styles.tabRow}>
          {['hafta','ay','yıl'].map(t => (
            <TouchableOpacity key={t} style={[styles.tabBtn, activeTab===t && styles.tabBtnActive]} onPress={() => setActiveTab(t)}>
              <Text style={[styles.tabText, activeTab===t && styles.tabTextActive]}>{t.charAt(0).toUpperCase()+t.slice(1)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading ? (
          <View style={[styles.barChart, { justifyContent: 'center' }]}><Text style={{ color: C.accentDim }}>Yükleniyor...</Text></View>
        ) : chartData.length === 0 ? (
          <View style={[styles.card, { alignItems: 'center', paddingVertical: 32 }]}>
            <Text style={{ color: C.accentDim, fontSize: 13 }}>😴 Bu dönem için kayıt yok</Text>
            <Text style={{ color: C.dim, fontSize: 12, marginTop: 4 }}>Ana ekrandan uyku başlat</Text>
          </View>
        ) : (
          <View style={styles.barChart}>
            {chartData.map((item, i) => (
              <View key={i} style={styles.barCol}>
                <Text style={styles.barHours}>{item.hours > 0 ? `${item.hours}` : ''}</Text>
                <View style={[styles.bar, { height: Math.max(4, (item.hours/maxH)*110), backgroundColor: item.color }]} />
                <Text style={styles.barDay}>{item.day}</Text>
              </View>
            ))}
          </View>
        )}

        {logs.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Dönem özeti</Text>
            {[
              { label: 'En uzun uyku', val: maxLog ? `${maxLog.durationHours} sa` : '—', color: C.green },
              { label: 'En kısa uyku', val: minLog ? `${minLog.durationHours} sa` : '—', color: C.red },
              { label: 'Ort. yatış', val: (() => { const a = logs.reduce((s,l) => { const d=new Date(l.startTime); return s+d.getHours()*60+d.getMinutes(); },0)/logs.length; return `${String(Math.floor(a/60)).padStart(2,'0')}:${String(Math.round(a%60)).padStart(2,'0')}`; })(), color: C.accentDim },
              { label: 'Uyku skoru', val: score!=='—' ? `${score}/100` : '—', color: C.accent },
            ].map((item, i) => (
              <View key={i} style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{item.label}</Text>
                <Text style={[styles.summaryVal, { color: item.color }]}>{item.val}</Text>
              </View>
            ))}
          </View>
        )}

        {logs.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Son kayıtlar</Text>
            {logs.slice(0,5).map((log,i) => {
              const ql = getSleepQualityLabel(log.rating*20);
              return (
                <TouchableOpacity key={i} style={styles.summaryRow} onPress={() => setSelected(log)}>
                  <View>
                    <Text style={{ color: C.white, fontSize: 13, fontWeight: '500' }}>{new Date(log.date).toLocaleDateString('tr-TR')}</Text>
                    <Text style={{ color: C.dim, fontSize: 11 }}>{log.quality || '—'}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ color: C.accentDim, fontSize: 13, fontWeight: '600' }}>{log.durationHours} saat</Text>
                    <Text style={{ color: ql.color, fontSize: 11 }}>{'★'.repeat(log.rating||3)} {ql.label}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <Text style={styles.sectionTitle}>Uyku önerileri</Text>
        <View style={[styles.card, { borderLeftWidth: 2, borderLeftColor: C.bg4 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <TouchableOpacity onPress={() => setTipIndex(p => (p-1+TIPS.length)%TIPS.length)} style={{ padding: 8 }}>
              <Text style={{ color: C.accentDim, fontSize: 24 }}>‹</Text>
            </TouchableOpacity>
            <View style={{ flex: 1, alignItems: 'center', paddingHorizontal: 8 }}>
              <Text style={{ fontSize: 28, marginBottom: 8 }}>{tip.icon}</Text>
              <Text style={{ color: C.white, fontSize: 15, fontWeight: '600', marginBottom: 8, textAlign: 'center' }}>{tip.title}</Text>
              <Text style={{ color: C.accentDim, fontSize: 13, lineHeight: 20, textAlign: 'center' }}>{tip.body}</Text>
            </View>
            <TouchableOpacity onPress={() => setTipIndex(p => (p+1)%TIPS.length)} style={{ padding: 8 }}>
              <Text style={{ color: C.accentDim, fontSize: 24 }}>›</Text>
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6 }}>
            {TIPS.map((_,i) => (
              <View key={i} style={{ width: i===tipIndex ? 16 : 6, height: 6, borderRadius: 3, backgroundColor: i===tipIndex ? C.accent : C.bg3 }} />
            ))}
          </View>
        </View>

      </ScrollView>

      <Modal visible={!!selectedLog} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Uyku Detayı</Text>
            {selectedLog && [
              { label: 'Tarih',  val: new Date(selectedLog.date).toLocaleDateString('tr-TR'), color: C.accentDim },
              { label: 'Süre',   val: `${selectedLog.durationHours} saat`, color: C.green },
              { label: 'Puan',   val: '★'.repeat(selectedLog.rating||3), color: C.amber },
              { label: 'Kalite', val: selectedLog.quality || '—', color: C.accentDim },
              { label: 'Ses',    val: selectedLog.sound || '—', color: C.accentDim },
            ].map((item,i) => (
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