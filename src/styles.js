import { StyleSheet } from 'react-native';

export const C = {
  bg:          '#171219',
  bg2:         '#221a24',
  bg3:         '#2e2030',
  bg4:         '#3d2a40',
  accent:      '#d4bcc8',
  accentDim:   '#a88fa0',
  accentFaint: '#d4bcc815',
  border:      '#4a3050',
  white:       '#ffffff',
  dim:         '#6b5570',
  green:       '#7ed4a0',
  amber:       '#e8c882',
  red:         '#e88080',
};

export default StyleSheet.create({
  title:        { fontSize: 24, fontWeight: '700', color: C.accent, letterSpacing: 4 },
  screenTitle:  { fontSize: 24, fontWeight: '700', color: C.white, marginBottom: 20 },
  sectionTitle: { fontSize: 11, fontWeight: '700', color: C.accentDim, marginTop: 8, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1.5 },
  dateText:     { fontSize: 12, color: C.accentDim },

  circle: { width: 150, height: 150, borderRadius: 75, backgroundColor: C.bg2, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: C.bg4 },
  circleEmoji:  { fontSize: 26 },
  circleHours:  { fontSize: 26, fontWeight: '700', color: C.white },
  circleLabel:  { fontSize: 11, color: C.dim, marginTop: 2 },

  wakeCard:  { backgroundColor: C.bg2, borderRadius: 12, paddingVertical: 10, alignItems: 'center', flex: 1, borderWidth: 1, borderColor: C.bg3 },
  wakeHour:  { fontSize: 10, color: C.accentDim, marginBottom: 2 },
  wakeTime:  { fontSize: 15, fontWeight: '700', color: C.white },
  wakeLabel: { fontSize: 9, color: C.dim, marginTop: 2 },

  timeRow:   { flexDirection: 'row', alignItems: 'center', gap: 24, marginBottom: 16 },
  timeBox:   { alignItems: 'center' },
  timeVal:   { fontSize: 20, fontWeight: '700', color: C.white },
  bigTime:   { fontSize: 30, fontWeight: '700', color: C.white },
  timeLbl:   { fontSize: 11, color: C.accentDim, marginTop: 3 },
  timeArrow: { fontSize: 18, color: C.border },

  button:          { backgroundColor: C.bg4, paddingVertical: 16, borderRadius: 14, alignItems: 'center', width: '100%' },
  buttonText:      { color: C.accent, fontSize: 15, fontWeight: '600', letterSpacing: 0.5 },
  buttonSecondary: { backgroundColor: 'transparent', paddingVertical: 14, borderRadius: 14, alignItems: 'center', width: '100%', borderWidth: 1, borderColor: C.border },
  buttonDanger:    { backgroundColor: 'transparent', paddingVertical: 14, borderRadius: 14, alignItems: 'center', width: '100%', borderWidth: 1, borderColor: C.red },

  soundGrid:      { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  soundBtn:       { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, backgroundColor: C.bg2, borderWidth: 1, borderColor: C.bg3 },
  soundBtnActive: { borderColor: C.accentDim, backgroundColor: C.bg4 },
  soundText:      { color: C.accentDim, fontSize: 13 },

  tipCard:  { backgroundColor: C.bg2, borderRadius: 14, padding: 16, borderLeftWidth: 2, borderLeftColor: C.bg4, width: '100%' },
  tipTitle: { fontSize: 13, fontWeight: '600', color: C.accent, marginBottom: 6 },
  tipBody:  { fontSize: 13, color: C.white, lineHeight: 20 },
  tipRow:   { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: C.bg3 },
  tipIcon:  { fontSize: 16 },
  tipRowText: { color: C.white, fontSize: 13, flex: 1 },

  card:      { backgroundColor: C.bg2, borderRadius: 14, padding: 16, marginBottom: 12 },
  cardTitle: { fontSize: 14, fontWeight: '600', color: C.white, marginBottom: 12 },
  cardRow:   { flexDirection: 'row', gap: 12, marginBottom: 12 },
  statCard:  { flex: 1, backgroundColor: C.bg2, borderRadius: 14, padding: 16 },
  statVal:   { fontSize: 26, fontWeight: '700', color: C.accent, marginBottom: 4 },
  statLbl:   { fontSize: 11, color: C.dim },

  tabRow:        { flexDirection: 'row', gap: 8, marginBottom: 12 },
  tabBtn:        { flex: 1, paddingVertical: 8, borderRadius: 10, backgroundColor: C.bg2, alignItems: 'center' },
  tabBtnActive:  { backgroundColor: C.bg4 },
  tabText:       { color: C.dim, fontSize: 13 },
  tabTextActive: { color: C.accent, fontWeight: '600' },

  barChart: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 160, backgroundColor: C.bg2, borderRadius: 14, padding: 16, marginBottom: 16 },
  barCol:   { alignItems: 'center', justifyContent: 'flex-end', gap: 4 },
  barHours: { fontSize: 10, color: C.accentDim },
  bar:      { width: 26, borderRadius: 6 },
  barDay:   { fontSize: 11, color: C.dim, marginTop: 4 },

  summaryRow:   { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: C.bg3 },
  summaryLabel: { color: C.accentDim, fontSize: 13 },
  summaryVal:   { fontSize: 13, fontWeight: '600', color: C.white },

  goalRow:       { flexDirection: 'row', gap: 8, marginBottom: 12 },
  goalBtn:       { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: C.bg, alignItems: 'center', borderWidth: 1, borderColor: C.bg3 },
  goalBtnActive: { backgroundColor: C.bg4, borderColor: C.bg4 },
  goalText:      { color: C.dim, fontSize: 13 },
  goalTextActive:{ color: C.accent, fontWeight: '600' },
  goalResult:    { color: C.accentDim, fontSize: 13, textAlign: 'center', marginTop: 6 },

  ratingBtn:       { width: 44, height: 44, borderRadius: 10, backgroundColor: C.bg2, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.bg3 },
  ratingBtnActive: { borderColor: C.accent, backgroundColor: C.bg4 },
  ratingText:      { fontSize: 16, color: C.accent },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  modalCard:    { backgroundColor: C.bg2, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, borderTopWidth: 1, borderTopColor: C.border },
  modalTitle:   { fontSize: 18, fontWeight: '700', color: C.white, marginBottom: 16, textAlign: 'center' },

  babyEntry: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: C.bg3 },
  babyDot:   { width: 8, height: 8, borderRadius: 4, marginTop: 5 },
  babyTime:  { fontSize: 14, fontWeight: '500', color: C.white },

  leagueItem:    { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: C.bg3 },
  leagueRank:    { fontSize: 15, fontWeight: '700', color: C.dim, width: 24 },
  avatar:        { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  avatarText:    { fontSize: 12, fontWeight: '600' },
  leagueName:    { fontSize: 14, fontWeight: '500', color: C.white },
  leagueHours:   { fontSize: 12, color: C.dim },
  leagueBarWrap: { width: 60 },
  leagueBarBg:   { height: 4, backgroundColor: C.bg3, borderRadius: 2 },
  leagueBarFill: { height: 4, borderRadius: 2 },
  badge:         { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },

  input: { backgroundColor: C.bg, borderRadius: 12, padding: 14, color: C.white, fontSize: 15, borderWidth: 1, borderColor: C.border },
});