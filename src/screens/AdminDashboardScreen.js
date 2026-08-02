import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const NYXSCREAM = {
  void: '#0D0221',
  shadow: '#1A0A2E',
  scream: '#FF003C',
  nyx: '#9D00FF',
  electric: '#00F0FF',
  ghost: '#E0E0E0',
  mist: '#6B6B6B'
};

export default function AdminDashboardScreen({ navigation }) {
  const [stats, setStats] = useState({
    totalUsers: 12450,
    activeNow: 3847,
    totalCreators: 2156,
    liveNow: 127,
    reportedContent: 89,
    bannedUsers: 34,
    totalRevenue: 45670.50,
    monthlyGrowth: 12.5
  });

  const [recentReports, setRecentReports] = useState([
    { id: 1, reporter: 'User123', reported: 'Creator456', reason: 'Hate speech', status: 'pending', time: '5m ago' },
    { id: 2, reporter: 'User789', reported: 'User101', reason: 'Harassment', status: 'investigating', time: '15m ago' },
    { id: 3, reporter: 'User555', reported: 'Creator222', reason: 'NSFW content', status: 'resolved', time: '1h ago' }
  ]);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[NYXSCREAM.shadow, NYXSCREAM.void]} style={styles.header}>
        <Text style={styles.headerTitle}>ADMIN DASHBOARD</Text>
        <Text style={styles.headerSubtitle}>Platform Control Center</Text>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Users</Text>
            <Text style={styles.statValue}>{stats.totalUsers.toLocaleString()}</Text>
            <Text style={styles.statTrend}>↑ {stats.monthlyGrowth}%</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Online Now</Text>
            <Text style={styles.statValue}>{stats.activeNow.toLocaleString()}</Text>
            <Text style={styles.statTrend}>Active users</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Creators</Text>
            <Text style={styles.statValue}>{stats.totalCreators.toLocaleString()}</Text>
            <Text style={styles.statTrend}>Verified</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Live Now</Text>
            <Text style={styles.statValue}>{stats.liveNow}</Text>
            <Text style={styles.statTrend}>Streaming</Text>
          </View>

          <View style={[styles.statCard, styles.dangerCard]}>
            <Text style={styles.statLabel}>Reported Content</Text>
            <Text style={styles.statValue}>{stats.reportedContent}</Text>
            <Text style={styles.statTrend}>Pending review</Text>
          </View>

          <View style={[styles.statCard, styles.warningCard]}>
            <Text style={styles.statLabel}>Banned Users</Text>
            <Text style={styles.statValue}>{stats.bannedUsers}</Text>
            <Text style={styles.statTrend}>Suspended</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ QUICK ACTIONS</Text>
          
          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('ModeratorPanel')}>
            <Text style={styles.actionButtonText}>👁️ View Reports ({stats.reportedContent})</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('UserManagement')}>
            <Text style={styles.actionButtonText}>👥 Manage Users</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('BannedUsers')}>
            <Text style={styles.actionButtonText}>🚫 Banned Users ({stats.bannedUsers})</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('AuditLog')}>
            <Text style={styles.actionButtonText}>📋 Audit Log</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Analytics')}>
            <Text style={styles.actionButtonText}>📊 Analytics</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('SystemSettings')}>
            <Text style={styles.actionButtonText}>⚙️ System Settings</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Reports */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📢 RECENT REPORTS</Text>
          
          {recentReports.map((report) => (
            <View key={report.id} style={styles.reportCard}>
              <View style={styles.reportHeader}>
                <Text style={styles.reportTitle}>{report.reason}</Text>
                <View style={[styles.statusBadge, styles[`status_${report.status}`]]}>
                  <Text style={styles.statusText}>{report.status.toUpperCase()}</Text>
                </View>
              </View>
              <Text style={styles.reportText}>
                Reporter: <Text style={styles.highlight}>{report.reporter}</Text>
              </Text>
              <Text style={styles.reportText}>
                Reported: <Text style={styles.highlight}>{report.reported}</Text>
              </Text>
              <Text style={styles.reportTime}>{report.time}</Text>

              <View style={styles.reportActions}>
                <TouchableOpacity style={styles.reviewButton} onPress={() => Alert.alert('Review', `Reviewing report from ${report.reporter}`)}>
                  <Text style={styles.reviewButtonText}>REVIEW</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.dismissButton}>
                  <Text style={styles.dismissButtonText}>DISMISS</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: NYXSCREAM.void },
  header: { paddingVertical: 20, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: NYXSCREAM.electric },
  headerTitle: { fontSize: 24, fontWeight: '900', color: NYXSCREAM.ghost, letterSpacing: 2 },
  headerSubtitle: { fontSize: 12, color: NYXSCREAM.electric, marginTop: 5 },
  content: { flex: 1, padding: 15 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 },
  statCard: { width: '48%', backgroundColor: NYXSCREAM.shadow, borderWidth: 1, borderColor: NYXSCREAM.nyx, borderRadius: 8, padding: 12, marginBottom: 10 },
  dangerCard: { borderColor: NYXSCREAM.scream },
  warningCard: { borderColor: '#FFD700' },
  statLabel: { color: NYXSCREAM.mist, fontSize: 11, fontWeight: '700', marginBottom: 8 },
  statValue: { color: NYXSCREAM.electric, fontSize: 20, fontWeight: '900', marginBottom: 5 },
  statTrend: { color: NYXSCREAM.ghost, fontSize: 10 },
  section: { marginBottom: 25 },
  sectionTitle: { color: NYXSCREAM.ghost, fontSize: 14, fontWeight: '900', letterSpacing: 1, marginBottom: 12 },
  actionButton: { backgroundColor: NYXSCREAM.shadow, borderWidth: 1, borderColor: NYXSCREAM.electric, borderRadius: 8, paddingVertical: 12, paddingHorizontal: 15, marginBottom: 8 },
  actionButtonText: { color: NYXSCREAM.electric, fontWeight: '700', fontSize: 13 },
  reportCard: { backgroundColor: NYXSCREAM.shadow, borderWidth: 1, borderColor: NYXSCREAM.nyx, borderRadius: 8, padding: 15, marginBottom: 12 },
  reportHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  reportTitle: { color: NYXSCREAM.ghost, fontWeight: '900', fontSize: 13 },
  statusBadge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 4 },
  status_pending: { backgroundColor: 'rgba(255, 215, 0, 0.2)', borderWidth: 1, borderColor: '#FFD700' },
  status_investigating: { backgroundColor: 'rgba(0, 240, 255, 0.2)', borderWidth: 1, borderColor: NYXSCREAM.electric },
  status_resolved: { backgroundColor: 'rgba(0, 255, 0, 0.2)', borderWidth: 1, borderColor: '#00FF00' },
  statusText: { fontSize: 10, fontWeight: '900', color: NYXSCREAM.ghost },
  reportText: { color: NYXSCREAM.mist, fontSize: 12, marginBottom: 5 },
  highlight: { color: NYXSCREAM.electric, fontWeight: '700' },
  reportTime: { color: NYXSCREAM.mist, fontSize: 10, fontStyle: 'italic', marginBottom: 10 },
  reportActions: { flexDirection: 'row', gap: 10 },
  reviewButton: { flex: 1, backgroundColor: NYXSCREAM.scream, paddingVertical: 8, borderRadius: 4, alignItems: 'center' },
  reviewButtonText: { color: NYXSCREAM.void, fontWeight: '900', fontSize: 11 },
  dismissButton: { flex: 1, backgroundColor: NYXSCREAM.void, borderWidth: 1, borderColor: NYXSCREAM.mist, paddingVertical: 8, borderRadius: 4, alignItems: 'center' },
  dismissButtonText: { color: NYXSCREAM.mist, fontWeight: '700', fontSize: 11 }
});
