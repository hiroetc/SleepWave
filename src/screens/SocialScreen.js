import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Modal, TextInput, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles, { C } from '../styles';

const FORMSPREE = 'https://formspree.io/f/mdayrjao';

const MOODS = ['Canlı', 'Normal', 'Yorgun', 'Bunaltıcı', 'Korkutucu', 'Huzurlu', 'Garip', 'Tekrarlayan'];

export default function SocialScreen() {
  const [dreams, setDreams]               = React.useState([]);
  const [dreamModal, setDreamModal]       = React.useState(false);
  const [dreamListModal, setListModal]    = React.useState(false);
  const [selectedDream, setSelected]      = React.useState(null);
  const [feedbackModal, setFeedbackModal] = React.useState(false);
  const [feedbackType, setFbType]         = React.useState(null);
  const [feedbackText, setFbText]         = React.useState('');
  const [sending, setSending]             = React.useState(false);

  // Rüya form
  const [title, setTitle]     = React.useState('');
  const [body, setBody]       = React.useState('');
  const [mood, setMood]       = React.useState(null);
  const [lucid, setLucid]     = React.useState(false);
  const [recurring, setRecurring] = React.useState(false);

  React.useEffect(() => { loadDreams(); }, []);

  const loadDreams = async () => {
    try {
      const d = await AsyncStorage.getItem('dreams');
      if (d) setDreams(JSON.parse(d));
    } catch (_) {}
  };

  const saveDream = async () => {
    if (!title.trim()) { Alert.alert('Başlık gerekli', 'Rüyana bir başlık ver.'); return; }
    const dream = {
      id: Date.now().toString(),
      title: title.trim(),
      body: body.trim(),
      mood,
      lucid,
      recurring,
      date: new Date().toLocaleDateString('tr-TR'),
      time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      ts: Date.now(),
    };
    const updated = [dream, ...dreams];
    await AsyncStorage.setItem('dreams', JSON.stringify(updated));
    setDreams(updated);
    setTitle(''); setBody(''); setMood(null); setLucid(false); setRecurring(false);
    setDreamModal(false);
    Alert.alert('Kaydedildi', '', [{ text: 'Tamam' }]);
  };

  const deleteDream = (id) => {
    Alert.alert('Rüyayı sil', 'Bu kaydı silmek istediğine emin misin?', [
      { text: 'Vazgeç', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: async () => {
        const updated = dreams.filter(d => d.id !== id);
        await AsyncStorage.setItem('dreams', JSON.stringify(updated));
        setDreams(updated);
        setSelected(null);
      }},
    ]);
  };

  const sendFeedback = async () => {
    if (!feedbackText.trim()) return;
    setSending(true);
    try {
      const res = await fetch(FORMSPREE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ type: feedbackType, message: feedbackText, date: new Date().toLocaleString('tr-TR') }),
      });
      if (res.ok) {
        Alert.alert('Gönderildi', 'Mesajın alındı.', [{ text: 'Tamam' }]);
        setFbText(''); setFbType(null); setFeedbackModal(false);
      } else Alert.alert('Hata', 'Gönderilemedi, tekrar dene.');
    } catch (_) { Alert.alert('Bağlantı hatası', 'İnternet bağlantını kontrol et.'); }
    setSending(false);
  };

  const getMoodColor = (m) => {
    if (!m) return C.dim;
    if (['Huzurlu', 'Canlı'].includes(m)) return C.green;
    if (['Korkutucu', 'Bunaltıcı'].includes(m)) return C.red;
    return C.accentDim;
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView contentContainerStyle={{ paddingTop: 52, paddingHorizontal: 20, paddingBottom: 40 }}>

        {/* Rüya Defteri */}
        <Text style={styles.screenTitle}>Günlük</Text>

        <Text style={styles.sectionTitle}>Rüya Defteri</Text>

        {/* Yeni rüya */}
        <TouchableOpacity
          style={[styles.card, { borderWidth: 1, borderColor: C.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}
          onPress={() => setDreamModal(true)}
        >
          <View>
            <Text style={{ color: C.white, fontWeight: '600', fontSize: 14 }}>Yeni kayıt</Text>
            <Text style={{ color: C.dim, fontSize: 12, marginTop: 2 }}>Bu gece ne gördün?</Text>
          </View>
          <Text style={{ color: C.accentDim, fontSize: 22 }}>+</Text>
        </TouchableOpacity>

        {/* Rüya listesi */}
        {dreams.length > 0 ? (
          <>
            <TouchableOpacity
              style={[styles.card, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }]}
              onPress={() => setListModal(true)}
            >
              <View>
                <Text style={{ color: C.white, fontWeight: '600', fontSize: 14 }}>Tüm rüyalar</Text>
                <Text style={{ color: C.dim, fontSize: 12, marginTop: 2 }}>{dreams.length} kayıt</Text>
              </View>
              <Text style={{ color: C.accentDim, fontSize: 18 }}>›</Text>
            </TouchableOpacity>

            {dreams.slice(0, 3).map(d => (
              <TouchableOpacity
                key={d.id}
                style={[styles.card, { marginBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}
                onPress={() => setSelected(d)}
              >
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={{ color: C.white, fontWeight: '600', fontSize: 13 }}>{d.title}</Text>
                    {d.lucid && <View style={{ backgroundColor: C.bg4, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 }}>
                      <Text style={{ color: C.accent, fontSize: 9, fontWeight: '700' }}>LUCID</Text>
                    </View>}
                    {d.recurring && <View style={{ backgroundColor: C.bg3, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 }}>
                      <Text style={{ color: C.accentDim, fontSize: 9, fontWeight: '700' }}>TEKRAR</Text>
                    </View>}
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                    <Text style={{ color: C.dim, fontSize: 11 }}>{d.date} · {d.time}</Text>
                    {d.mood && <Text style={{ color: getMoodColor(d.mood), fontSize: 11 }}>{d.mood}</Text>}
                  </View>
                </View>
                <Text style={{ color: C.border, fontSize: 16 }}>›</Text>
              </TouchableOpacity>
            ))}
          </>
        ) : (
          <View style={[styles.card, { alignItems: 'center', paddingVertical: 24 }]}>
            <Text style={{ color: C.dim, fontSize: 13 }}>Henüz rüya kaydedilmedi</Text>
          </View>
        )}

        {/* Geri bildirim */}
        <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Geri Bildirim</Text>

        {[
          { type: 'uyuyamıyorum', title: 'Uyuyamıyor musun?', sub: 'Sorununu bize ilet', color: C.red },
          { type: 'uyku değerlendirmesi', title: 'Bugün nasıl uyudun?', sub: 'Deneyimini paylaş', color: C.green },
          { type: 'öneri', title: 'Öneri veya şikayet', sub: 'Uygulama hakkında görüşlerini ilet', color: C.accentDim },
        ].map(item => (
          <TouchableOpacity
            key={item.type}
            style={[styles.card, { borderLeftWidth: 2, borderLeftColor: item.color, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }]}
            onPress={() => { setFbType(item.type); setFeedbackModal(true); }}
          >
            <View>
              <Text style={{ color: C.white, fontWeight: '600', fontSize: 14 }}>{item.title}</Text>
              <Text style={{ color: C.dim, fontSize: 12, marginTop: 2 }}>{item.sub}</Text>
            </View>
            <Text style={{ color: item.color, fontSize: 18 }}>›</Text>
          </TouchableOpacity>
        ))}

      </ScrollView>

      {/* ===== MODALLER ===== */}

      {/* Yeni rüya modalı */}
      <Modal visible={dreamModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { maxHeight: '90%' }]}>
            <Text style={styles.modalTitle}>Rüyayı Kaydet</Text>
            <ScrollView showsVerticalScrollIndicator={false}>

              <Text style={{ color: C.accentDim, fontSize: 12, marginBottom: 6 }}>BAŞLIK</Text>
              <TextInput
                style={[styles.input, { marginBottom: 14 }]}
                placeholder="Rüyanın başlığı..."
                placeholderTextColor={C.dim}
                value={title}
                onChangeText={setTitle}
              />

              <Text style={{ color: C.accentDim, fontSize: 12, marginBottom: 6 }}>ANLAT</Text>
              <TextInput
                style={[styles.input, { height: 120, textAlignVertical: 'top', marginBottom: 14 }]}
                placeholder="Ne gördün? (isteğe bağlı)"
                placeholderTextColor={C.dim}
                value={body}
                onChangeText={setBody}
                multiline
              />

              <Text style={{ color: C.accentDim, fontSize: 12, marginBottom: 8 }}>DUYGU TONU</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
                {MOODS.map(m => (
                  <TouchableOpacity
                    key={m}
                    style={{
                      paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
                      backgroundColor: mood === m ? C.bg4 : C.bg3,
                      borderWidth: 1, borderColor: mood === m ? C.accent : C.bg3,
                    }}
                    onPress={() => setMood(mood === m ? null : m)}
                  >
                    <Text style={{ color: mood === m ? C.accent : C.dim, fontSize: 13 }}>{m}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
                <TouchableOpacity
                  style={{
                    flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center',
                    backgroundColor: lucid ? C.bg4 : C.bg3,
                    borderWidth: 1, borderColor: lucid ? C.accent : C.bg3,
                  }}
                  onPress={() => setLucid(!lucid)}
                >
                  <Text style={{ color: lucid ? C.accent : C.dim, fontSize: 13, fontWeight: '600' }}>Lucid rüya</Text>
                  <Text style={{ color: C.dim, fontSize: 11, marginTop: 2 }}>Farkındaydım</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center',
                    backgroundColor: recurring ? C.bg4 : C.bg3,
                    borderWidth: 1, borderColor: recurring ? C.accent : C.bg3,
                  }}
                  onPress={() => setRecurring(!recurring)}
                >
                  <Text style={{ color: recurring ? C.accent : C.dim, fontSize: 13, fontWeight: '600' }}>Tekrarlayan</Text>
                  <Text style={{ color: C.dim, fontSize: 11, marginTop: 2 }}>Daha önce gördüm</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.button} onPress={saveDream}>
                <Text style={styles.buttonText}>Kaydet</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.buttonSecondary, { marginTop: 10 }]} onPress={() => { setDreamModal(false); setTitle(''); setBody(''); setMood(null); setLucid(false); setRecurring(false); }}>
                <Text style={[styles.buttonText, { color: C.accentDim }]}>Vazgeç</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Tüm rüyalar modalı */}
      <Modal visible={dreamListModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { maxHeight: '85%' }]}>
            <Text style={styles.modalTitle}>Rüya Defteri</Text>
            <FlatList
              data={dreams}
              keyExtractor={i => i.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.summaryRow, { paddingVertical: 12 }]}
                  onPress={() => { setSelected(item); setListModal(false); }}
                >
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={{ color: C.white, fontWeight: '600', fontSize: 13 }}>{item.title}</Text>
                      {item.lucid && <Text style={{ color: C.accent, fontSize: 10 }}>LUCID</Text>}
                      {item.recurring && <Text style={{ color: C.accentDim, fontSize: 10 }}>TEKRAR</Text>}
                    </View>
                    <View style={{ flexDirection: 'row', gap: 8, marginTop: 3 }}>
                      <Text style={{ color: C.dim, fontSize: 11 }}>{item.date}</Text>
                      {item.mood && <Text style={{ color: getMoodColor(item.mood), fontSize: 11 }}>{item.mood}</Text>}
                    </View>
                  </View>
                  <Text style={{ color: C.border, fontSize: 16 }}>›</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={[styles.button, { marginTop: 16 }]} onPress={() => setListModal(false)}>
              <Text style={styles.buttonText}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Rüya detay modalı */}
      <Modal visible={!!selectedDream} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { maxHeight: '85%' }]}>
            {selectedDream && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.modalTitle}>{selectedDream.title}</Text>
                <Text style={{ color: C.dim, fontSize: 12, textAlign: 'center', marginBottom: 16 }}>
                  {selectedDream.date} · {selectedDream.time}
                </Text>

                <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'center', marginBottom: 16 }}>
                  {selectedDream.lucid && (
                    <View style={{ backgroundColor: C.bg4, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 5 }}>
                      <Text style={{ color: C.accent, fontSize: 12, fontWeight: '600' }}>Lucid Rüya</Text>
                    </View>
                  )}
                  {selectedDream.recurring && (
                    <View style={{ backgroundColor: C.bg3, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 5 }}>
                      <Text style={{ color: C.accentDim, fontSize: 12, fontWeight: '600' }}>Tekrarlayan</Text>
                    </View>
                  )}
                  {selectedDream.mood && (
                    <View style={{ backgroundColor: C.bg3, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 5 }}>
                      <Text style={{ color: getMoodColor(selectedDream.mood), fontSize: 12, fontWeight: '600' }}>
                        {selectedDream.mood}
                      </Text>
                    </View>
                  )}
                </View>

                {selectedDream.body ? (
                  <View style={[styles.card, { marginBottom: 16 }]}>
                    <Text style={{ color: C.white, fontSize: 14, lineHeight: 22 }}>{selectedDream.body}</Text>
                  </View>
                ) : (
                  <Text style={{ color: C.dim, fontSize: 13, textAlign: 'center', marginBottom: 16 }}>
                    Açıklama girilmemiş.
                  </Text>
                )}

                <TouchableOpacity style={styles.button} onPress={() => setSelected(null)}>
                  <Text style={styles.buttonText}>Kapat</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.buttonDanger, { marginTop: 10 }]} onPress={() => deleteDream(selectedDream.id)}>
                  <Text style={[styles.buttonText, { color: C.red }]}>Sil</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Geri bildirim modalı */}
      <Modal visible={feedbackModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {feedbackType === 'uyuyamıyorum' ? 'Uyku Sorunu'
               : feedbackType === 'uyku değerlendirmesi' ? 'Uyku Değerlendirmesi'
               : 'Öneri / Şikayet'}
            </Text>
            <Text style={{ color: C.accentDim, fontSize: 13, marginBottom: 16, textAlign: 'center' }}>
              Mesajın bize iletilecek.
            </Text>
            <TextInput
              style={[styles.input, { height: 140, textAlignVertical: 'top', marginBottom: 16 }]}
              placeholder="Mesajını buraya yaz..."
              placeholderTextColor={C.dim}
              value={feedbackText}
              onChangeText={setFbText}
              multiline
            />
            <TouchableOpacity style={[styles.button, sending && { opacity: 0.5 }]} onPress={sendFeedback} disabled={sending}>
              <Text style={styles.buttonText}>{sending ? 'Gönderiliyor...' : 'Gönder'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.buttonSecondary, { marginTop: 10 }]} onPress={() => { setFeedbackModal(false); setFbText(''); setFbType(null); }}>
              <Text style={[styles.buttonText, { color: C.accentDim }]}>Vazgeç</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}