import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { search } from '../api/endpoints';
import { COLORS } from '../config/constants';
import ErrorMessage from '../components/common/ErrorMessage';

const HomeScreen = () => {
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Search filters
  const [searchSites, setSearchSites] = useState(true);
  const [searchLists, setSearchLists] = useState(false);
  const [searchUsers, setSearchUsers] = useState(false);
  
  // Results
  const [sites, setSites] = useState([]);
  const [lists, setLists] = useState([]);
  const [users, setUsers] = useState([]);

  const handleSearch = async () => {
    if (!searchInput.trim()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await search.searchAll({
        input: searchInput,
        is_site: searchSites,
        is_list: searchLists,
        is_user: searchUsers,
      });

      if (response.status === 'success') {
        setSites(response.message?.sites || []);
        setLists(response.message?.lists || []);
        setUsers(response.message?.users || []);
      }
    } catch (err) {
      setError(err.message);
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchInput('');
    setSites([]);
    setLists([]);
    setUsers([]);
    setError(null);
  };

  const renderSite = ({ item }) => (
    <TouchableOpacity style={styles.resultCard}>
      <Image
        source={{ uri: item.image }}
        style={styles.siteImage}
        defaultSource={require('../../assets/icon.png')}
      />
      <View style={styles.siteInfo}>
        <Text style={styles.siteName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.siteCity}>{item.city}</Text>
        
        <View style={styles.siteStats}>
          <View style={styles.statItem}>
            <Ionicons name="star" size={14} color={COLORS.primary} />
            <Text style={styles.statText}>{item.score}</Text>
          </View>
          
          <View style={styles.statItem}>
            <Ionicons name="chatbubble-outline" size={14} color="#666" />
            <Text style={styles.statText}>{item.num_opinions}</Text>
          </View>
          
          <View style={styles.statItem}>
            <Ionicons name="pricetag-outline" size={14} color="#666" />
            <Text style={styles.statText}>{item.price}</Text>
          </View>

          <View style={styles.statItem}>
            <Ionicons name="list-outline" size={14} color="#666" />
            <Text style={styles.statText}>{item.lists_count}</Text>
          </View>
        </View>

        {item.hashtags && item.hashtags.length > 0 && (
          <View style={styles.hashtagsContainer}>
            {item.hashtags.slice(0, 3).map((tag) => (
              <View key={tag.id} style={styles.hashtag}>
                <Text style={styles.hashtagText}>#{tag.name}</Text>
              </View>
            ))}
            {item.hashtags.length > 3 && (
              <Text style={styles.moreHashtags}>+{item.hashtags.length - 3}</Text>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderList = ({ item }) => (
    <TouchableOpacity style={styles.resultCard}>
      <View style={styles.listIcon}>
        <Ionicons name="list" size={24} color={COLORS.primary} />
      </View>
      <View style={styles.listInfo}>
        <Text style={styles.listName}>{item.name}</Text>
        <Text style={styles.listDetails}>
          {item.sites_count} restaurants • Created by {item.creator}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderUser = ({ item }) => (
    <TouchableOpacity style={styles.resultCard}>
      <View style={styles.userAvatar}>
        <Ionicons name="person" size={24} color={COLORS.primary} />
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userUsername}>@{item.username}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderResults = () => {
    const hasResults = sites.length > 0 || lists.length > 0 || users.length > 0;

    if (!hasResults && !loading) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={64} color="#CCC" />
          <Text style={styles.emptyText}>
            {searchInput ? 'No results found' : 'Search for restaurants, lists, or users'}
          </Text>
        </View>
      );
    }

    return (
      <>
        {sites.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Restaurants ({sites.length})</Text>
            <FlatList
              data={sites}
              renderItem={renderSite}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          </View>
        )}

        {lists.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Lists ({lists.length})</Text>
            <FlatList
              data={lists}
              renderItem={renderList}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          </View>
        )}

        {users.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Users ({users.length})</Text>
            <FlatList
              data={users}
              renderItem={renderUser}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          </View>
        )}
      </>
    );
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search restaurants, lists, users..."
            value={searchInput}
            onChangeText={setSearchInput}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchInput.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>

        {/* Search Filters */}
        <View style={styles.filtersContainer}>
          <TouchableOpacity
            style={[styles.filterChip, searchSites && styles.filterChipActive]}
            onPress={() => setSearchSites(!searchSites)}
          >
            <Ionicons
              name="restaurant"
              size={16}
              color={searchSites ? '#FFF' : '#666'}
            />
            <Text style={[styles.filterText, searchSites && styles.filterTextActive]}>
              Restaurants
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, searchLists && styles.filterChipActive]}
            onPress={() => setSearchLists(!searchLists)}
          >
            <Ionicons
              name="list"
              size={16}
              color={searchLists ? '#FFF' : '#666'}
            />
            <Text style={[styles.filterText, searchLists && styles.filterTextActive]}>
              Lists
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, searchUsers && styles.filterChipActive]}
            onPress={() => setSearchUsers(!searchUsers)}
          >
            <Ionicons
              name="people"
              size={16}
              color={searchUsers ? '#FFF' : '#666'}
            />
            <Text style={[styles.filterText, searchUsers && styles.filterTextActive]}>
              Users
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleSearch}
          disabled={loading || !searchInput.trim()}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.searchButtonText}>Search</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Results */}
      {error ? (
        <ErrorMessage message={error} onRetry={handleSearch} />
      ) : (
        <FlatList
          data={[{ key: 'results' }]}
          renderItem={() => renderResults()}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.resultsContainer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  searchContainer: {
    backgroundColor: '#FFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  clearButton: {
    padding: 4,
  },
  filtersContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    gap: 4,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    fontSize: 14,
    color: '#666',
  },
  filterTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  searchButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsContainer: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  resultCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  siteImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  siteInfo: {
    flex: 1,
  },
  siteName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  siteCity: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  siteStats: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#666',
  },
  hashtagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  hashtag: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  hashtagText: {
    fontSize: 11,
    color: COLORS.primary,
  },
  moreHashtags: {
    fontSize: 11,
    color: '#999',
    alignSelf: 'center',
  },
  listIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  listInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  listName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  listDetails: {
    fontSize: 14,
    color: '#666',
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  userUsername: {
    fontSize: 14,
    color: '#666',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});

export default HomeScreen;