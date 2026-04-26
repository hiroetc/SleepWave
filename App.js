import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

const Tab = createBottomTabNavigator();

// ==================== ANA SAYFA ====================
function HomeScreen() {
  const [sleeping, setSleeping] = React.useState(false);
  const [selectedSound, setSelectedSound] = React.useState('🌧 Yağmur');

  const sounds = ['🌧 Yağmur', '🌊 Okyanus', '🔥 Ateş', '🍃 Rüzgar', '🎵 Beyaz ses', '🌙 Sessizlik'];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#1a1a2e' }} contentContainerStyle={{ alignItems: 'center', paddingTop: 60, paddingBottom: 40, paddingHorizontal: 24 }}>
      <Text style={styles.greeting}>İyi geceler 👋</Text>
      <Text style={styles.title}>SleepWave</Text>

      <View style={styles.circle}>
        <Text style={styles.circleEmoji}>🌙</Text>
        <Text style={styles.circleHours}>7.5</Text>
        <Text style={styles.circleLabel}>saat uyku</Text>
      </View>

      <View style={styles.timeRow}>
        <View style={styles.timeBox}>
          <Text style={styles.timeVal}>23:00</Text>
          <Text style={styles.timeLbl}>Yatış</Text>
        </View>
        <Text style={styles.timeArrow}>→</Text>
        <View style={styles.timeBox}>
          <Text style={styles.timeVal}>06:30</Text>
          <Text style={styles.timeLbl}>Kalkış</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Uyku sesleri</Text>
      <View style={styles.soundGrid}>
        {sounds.map((sound) => (
          <TouchableOpacity
            key={sound}
            style={[styles.soundBtn, selectedSound === sound && styles.soundBtnActive]}
            onPress={() => setSelectedSound(sound)}
          >
            <Text style={styles.soundText}>{sound}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.button, sleeping && styles.buttonActive]}
        onPress={() => setSleeping(!sleeping)}
      >
        <Text style={styles.buttonText}>
          {sleeping ? '⏹ Uyku bitti' : '▶ Uyumaya başla'}
        </Text>
      </TouchableOpacity>

      <View style={styles.tipCard}>
        <Text style={styles.tipTitle}>💡 Uyku ipucu</Text>
        <Text style={styles.tipBody}>Yatmadan 1 saat önce telefon ekranından uzak dur. Mavi ışık melatonin üretimini azaltır.</Text>
      </View>
    </ScrollView>
  );
}

// ==================== ALARM ====================
function AlarmScreen() {
  const [selectedGoal, setSelectedGoal] = React.useState(8);
  const goals = [6, 7, 8, 9];

  const calcWakeTime = (hours) => {
    const bedHour = 23;
    const bedMin = 0;
    const totalMins = bedHour * 60 + bedMin + hours * 60;
    const wakeHour = Math.floor((totalMins % 1440) / 60);
    const wakeMin = totalMins % 60;
    return `${String(wakeHour).padStart(2, '0')}:${String(wakeMin).padStart(2, '0')}`;
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#1a1a2e' }} contentContainerStyle={{ paddingTop: 60, paddingHorizontal: 20, paddingBottom: 40 }}>
      <Text style={styles.screenTitle}>Alarm Kur</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Yatış saati</Text>
        <View style={styles.timeRow}>
          <View style={styles.timeBox}>
            <Text style={styles.bigTime}>23:00</Text>
            <Text style={styles.timeLbl}>Yatış</Text>
          </View>
          <Text style={styles.timeArrow}>→</Text>
          <View style={styles.timeBox}>
            <Text style={styles.bigTime}>{calcWakeTime(selectedGoal)}</Text>
            <Text style={styles.timeLbl}>Kalkış</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Kaç saat uyumak istiyorsun?</Text>
        <View style={styles.goalRow}>
          {goals.map((g) => (
            <TouchableOpacity
              key={g}
              style={[styles.goalBtn, selectedGoal === g && styles.goalBtnActive]}
              onPress={() => setSelectedGoal(g)}
            >
              <Text style={[styles.goalText, selectedGoal === g && styles.goalTextActive]}>{g} saat</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.goalResult}>
          {selectedGoal} saat için {calcWakeTime(selectedGoal)}'da uyanmalısın
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Bu haftaki uyku ipuçları</Text>
        {[
          { icon: '📵', tip: 'Yatmadan 1 saat önce ekran kapatın' },
          { icon: '🌡', tip: 'Oda sıcaklığını 18-20°C tutun' },
          { icon: '☕', tip: 'Öğleden sonra kafein almaktan kaçının' },
          { icon: '🧘', tip: 'Yatmadan önce 4-7-8 nefes tekniğini deneyin' },
        ].map((item, i) => (
          <View key={i} style={styles.tipRow}>
            <Text style={styles.tipIcon}>{item.icon}</Text>
            <Text style={styles.tipRowText}>{item.tip}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>⏰ Alarm kur</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ==================== İSTATİSTİK ====================
function StatsScreen() {
  const weekData = [
    { day: 'Pzt', hours: 7, color: '#534AB7' },
    { day: 'Sal', hours: 5, color: '#AFA9EC' },
    { day: 'Çar', hours: 8, color: '#534AB7' },
    { day: 'Per', hours: 4, color: '#2a2a4e' },
    { day: 'Cum', hours: 6, color: '#AFA9EC' },
    { day: 'Cmt', hours: 9, color: '#534AB7' },
    { day: 'Paz', hours: 7, color: '#534AB7' },
  ];

  const maxHours = 10;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#1a1a2e' }} contentContainerStyle={{ paddingTop: 60, paddingHorizontal: 20, paddingBottom: 40 }}>
      <Text style={styles.screenTitle}>İstatistikler</Text>

      <View style={styles.cardRow}>
        <View style={styles.statCard}>
          <Text style={styles.statVal}>6.8</Text>
          <Text style={styles.statLbl}>Haftalık ortalama</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statVal, { color: '#27AA62' }]}>82</Text>
          <Text style={styles.statLbl}>Uyku skoru</Text>
        </View>
      </View>

      <View style={styles.cardRow}>
        <View style={styles.statCard}>
          <Text style={[styles.statVal, { color: '#EF9F27' }]}>-3.5</Text>
          <Text style={styles.statLbl}>Uyku borcu (saat)</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statVal}>🔥 5</Text>
          <Text style={styles.statLbl}>Günlük seri</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Bu hafta</Text>
      <View style={styles.barChart}>
        {weekData.map((item) => (
          <View key={item.day} style={styles.barCol}>
            <Text style={styles.barHours}>{item.hours}s</Text>
            <View style={[styles.bar, { height: (item.hours / maxHours) * 120, backgroundColor: item.color }]} />
            <Text style={styles.barDay}>{item.day}</Text>
          </View>
        ))}
      </View>

      <View style={styles.tipCard}>
        <Text style={styles.tipTitle}>💡 Bu haftaki öneri</Text>
        <Text style={styles.tipBody}>Perşembe günü sadece 4 saat uyudun. Düzenli uyku için her gün aynı saatte yat!</Text>
      </View>
    </ScrollView>
  );
}

// ==================== ARKADAŞLAR ====================
function SocialScreen() {
  const league = [
    { rank: 1, name: 'Zeynep K.', hours: 8.2, score: 94, color: '#27AA62', initials: 'ZK' },
    { rank: 2, name: 'Sen', hours: 6.8, score: 82, color: '#534AB7', initials: 'SEN' },
    { rank: 3, name: 'Mehmet A.', hours: 6.1, score: 71, color: '#EF9F27', initials: 'MA' },
    { rank: 4, name: 'Buse Ç.', hours: 5.5, score: 60, color: '#D85A30', initials: 'BÇ' },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#1a1a2e' }} contentContainerStyle={{ paddingTop: 60, paddingHorizontal: 20, paddingBottom: 40 }}>
      <Text style={styles.screenTitle}>Uyku Ligi</Text>

      <View style={styles.tipCard}>
        <Text style={styles.tipTitle}>🏆 Bu haftaki meydan okuma</Text>
        <Text style={styles.tipBody}>Bu hafta herkes 7+ saat uyusun! 3/4 arkadaş hedefe ulaştı.</Text>
      </View>

      <Text style={styles.sectionTitle}>Sıralama</Text>
      {league.map((item) => (
        <View key={item.rank} style={styles.leagueItem}>
          <Text style={[styles.leagueRank, item.rank === 1 && { color: '#EF9F27' }]}>{item.rank}</Text>
          <View style={[styles.avatar, { backgroundColor: item.color + '33' }]}>
            <Text style={[styles.avatarText, { color: item.color }]}>{item.initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.leagueName}>{item.name}</Text>
            <Text style={styles.leagueHours}>Ort. {item.hours} saat · Skor {item.score}</Text>
          </View>
          <View style={styles.leagueBarWrap}>
            <View style={styles.leagueBarBg}>
              <View style={[styles.leagueBarFill, { width: `${item.score}%`, backgroundColor: item.color }]} />
            </View>
          </View>
        </View>
      ))}

      <TouchableOpacity style={[styles.button, { marginTop: 20 }]}>
        <Text style={styles.buttonText}>👥 Arkadaş ekle</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, { marginTop: 12, backgroundColor: '#2a2a4e', borderWidth: 1, borderColor: '#534AB7' }]}>
        <Text style={styles.buttonText}>🏆 Meydan okuma gönder</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ==================== BEBEK ====================
function BabyScreen() {
  const sleepLog = [
    { type: 'sleep', time: '08:30 – 10:15', duration: '1 saat 45 dk', label: 'Sabah uykusu' },
    { type: 'wake', time: '10:15 – 13:00', duration: '2 saat 45 dk', label: 'Uyanık' },
    { type: 'sleep', time: '13:00 – 15:20', duration: '2 saat 20 dk', label: 'Öğle uykusu' },
    { type: 'sleep', time: '20:45 – devam ediyor', duration: 'Devam ediyor', label: 'Gece uykusu' },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#1a1a2e' }} contentContainerStyle={{ paddingTop: 60, paddingHorizontal: 20, paddingBottom: 40 }}>
      <Text style={styles.screenTitle}>Bebek Takibi</Text>

      <View style={styles.card}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={styles.cardTitle}>Ada · 6 aylık</Text>
            <Text style={styles.timeLbl}>Önerilen: 12-16 saat/gün</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: '#27AA6233' }]}>
            <Text style={{ color: '#27AA62', fontSize: 12, fontWeight: '600' }}>✓ Sağlıklı</Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Bugünkü uyku geçmişi</Text>
      {sleepLog.map((item, i) => (
        <View key={i} style={styles.babyEntry}>
          <View style={[styles.babyDot, { backgroundColor: item.type === 'sleep' ? '#534AB7' : '#EF9F27' }]} />
          <View>
            <Text style={styles.babyTime}>{item.time}</Text>
            <Text style={styles.timeLbl}>{item.duration} · {item.label}</Text>
          </View>
        </View>
      ))}

      <View style={styles.card}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={styles.timeLbl}>Bugün toplam uyku</Text>
          <Text style={[styles.statVal, { fontSize: 22 }]}>4 sa 5 dk</Text>
        </View>
      </View>

      <TouchableOpacity style={[styles.button, { marginTop: 12 }]}>
        <Text style={styles.buttonText}>🍼 Uyku başlat</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, { marginTop: 12, backgroundColor: '#2a2a4e', borderWidth: 1, borderColor: '#534AB7' }]}>
        <Text style={styles.buttonText}>📋 Uyku rehberi</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ==================== ANA APP ====================
export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#1a1a2e',
            borderTopColor: '#2a2a4e',
            height: 70,
            paddingBottom: 10,
            paddingTop: 8,
          },
          tabBarLabelStyle: { fontSize: 12 },
          tabBarActiveTintColor: '#AFA9EC',
          tabBarInactiveTintColor: '#555577',
        }}
      >
        <Tab.Screen name="Ana" component={HomeScreen} options={{ tabBarLabel: '🌙 Ana' }} />
        <Tab.Screen name="Alarm" component={AlarmScreen} options={{ tabBarLabel: '⏰ Alarm' }} />
        <Tab.Screen name="İstatistik" component={StatsScreen} options={{ tabBarLabel: '📊 İstatistik' }} />
        <Tab.Screen name="Sosyal" component={SocialScreen} options={{ tabBarLabel: '👥 Sosyal' }} />
        <Tab.Screen name="Bebek" component={BabyScreen} options={{ tabBarLabel: '🍼 Bebek' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

// ==================== STILLER ====================
const styles = StyleSheet.create({
  greeting: {
    fontSize: 20,
    color: '#ffffff',
    marginBottom: 8,
    fontWeight: '500',
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#AFA9EC',
    marginBottom: 16,
    letterSpacing: 2,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#AFA9EC',
    marginTop: 8,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 48,
  },
  circle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#2a2a4e',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 24,
    borderWidth: 3,
    borderColor: '#534AB7',
  },
  circleEmoji: { fontSize: 32 },
  circleHours: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#AFA9EC',
  },
  circleLabel: {
    fontSize: 13,
    color: '#ffffff',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    marginBottom: 24,
  },
  timeBox: { alignItems: 'center' },
  timeVal: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  bigTime: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#AFA9EC',
  },
  timeLbl: {
    fontSize: 12,
    color: '#AFA9EC',
    marginTop: 4,
  },
  timeArrow: {
    fontSize: 20,
    color: '#534AB7',
  },
  button: {
    backgroundColor: '#534AB7',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    width: '100%',
  },
  buttonActive: {
    backgroundColor: '#2a2a4e',
    borderWidth: 1,
    borderColor: '#534AB7',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  soundGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
    justifyContent: 'center',
  },
  soundBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#2a2a4e',
    borderWidth: 1,
    borderColor: '#2a2a4e',
  },
  soundBtnActive: {
    borderColor: '#534AB7',
    backgroundColor: '#534AB733',
  },
  soundText: {
    color: '#ffffff',
    fontSize: 13,
  },
  tipCard: {
    backgroundColor: '#2a2a4e',
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#534AB7',
    marginTop: 16,
    width: '100%',
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#AFA9EC',
    marginBottom: 6,
  },
  tipBody: {
    fontSize: 13,
    color: '#ffffff',
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#2a2a4e',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
  },
  cardRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#2a2a4e',
    borderRadius: 16,
    padding: 16,
  },
  statVal: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#AFA9EC',
    marginBottom: 4,
  },
  statLbl: {
    fontSize: 12,
    color: '#555577',
  },
  barChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 160,
    backgroundColor: '#2a2a4e',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  barCol: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  barHours: {
    fontSize: 10,
    color: '#AFA9EC',
  },
  bar: {
    width: 28,
    borderRadius: 6,
  },
  barDay: {
    fontSize: 11,
    color: '#555577',
    marginTop: 4,
  },
  goalRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  goalBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a4e',
  },
  goalBtnActive: {
    backgroundColor: '#534AB733',
    borderColor: '#534AB7',
  },
  goalText: {
    color: '#AFA9EC',
    fontSize: 13,
  },
  goalTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  goalResult: {
    color: '#AFA9EC',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#1a1a2e',
  },
  tipIcon: { fontSize: 20 },
  tipRowText: {
    color: '#ffffff',
    fontSize: 13,
    flex: 1,
  },
  leagueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#2a2a4e',
  },
  leagueRank: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#555577',
    width: 24,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '600',
  },
  leagueName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
  },
  leagueHours: {
    fontSize: 12,
    color: '#555577',
  },
  leagueBarWrap: { width: 60 },
  leagueBarBg: {
    height: 4,
    backgroundColor: '#2a2a4e',
    borderRadius: 2,
  },
  leagueBarFill: {
    height: 4,
    borderRadius: 2,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  babyEntry: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#2a2a4e',
  },
  babyDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  babyTime: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
  },
});
