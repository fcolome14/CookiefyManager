import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  TextInput,
  Switch,
  Alert,
  ActionSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { sites, images } from '../api/endpoints';
import { COLORS } from '../config/constants';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';

const SiteDetailsScreen = ({ route, navigation }) => {
  const { siteId } = route.params;
  const [site, setSite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Editable fields with default values
  const [editedSite, setEditedSite] = useState(null);
  const [newImageUri, setNewImageUri] = useState(null);

  useEffect(() => {
    fetchSiteDetails();
    requestPermissions();
  }, [siteId]);

  useEffect(() => {
    // Set header edit button
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => {
            if (isEditing) {
              handleCancel();
            } else {
              handleEdit();
            }
          }}
          style={{ marginRight: 16 }}
          disabled={!site} // Disable edit button when site is null
        >
          <Ionicons 
            name={isEditing ? "close" : "create-outline"} 
            size={24} 
            color={site ? "#FFF" : "#999"} // Gray out when disabled
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation, isEditing, site]); // Add site to dependencies

  const requestPermissions = async () => {
    // Request camera permission
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    if (cameraStatus !== 'granted') {
      console.log('Camera permission not granted');
    }

    // Request media library permission
    const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (mediaStatus !== 'granted') {
      console.log('Media library permission not granted');
    }
  };

  const fetchSiteDetails = async () => {
    try {
      setError(null);
      const response = await sites.getById(siteId);
      
      if (response.status === 'success') {
        const siteData = response.data.content;
        setSite(siteData);
        // Initialize editedSite with all default values
        console.log(siteData)
        setEditedSite({
          name: siteData.name || '',
          description: siteData.description || '',
          price: siteData.price || '',
          contact: siteData.contact || '',
          website: siteData.website || '',
          street: siteData.street || '',
          city: siteData.city || '',
          cuisine_type: siteData.cuisine_type || '',
          is_vegan: siteData.is_vegan || false,
          is_gluten_free: siteData.is_gluten_free || false,
          is_halal: siteData.is_halal || false,
          active: siteData.active !== undefined ? siteData.active : true,
          // Include other fields that shouldn't be edited but need to be sent
          province: siteData.province || '',
          region: siteData.region || '',
          country: siteData.country || '',
          lat: siteData.lat || 0,
          lon: siteData.lon || 0,
          score: siteData.score || 0,
          num_opinions: siteData.num_opinions || 0,
        });
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching site details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    // CRITICAL FIX: Don't allow editing if site data isn't loaded yet
    if (!site) {
      console.warn('Cannot edit - site data not loaded yet');
      return;
    }
    
    setIsEditing(true);
    // Reset to current site data
    setEditedSite({
      name: site.name || '',
      description: site.description || '',
      price: site.price || '',
      contact: site.contact || '',
      website: site.website || '',
      street: site.street || '',
      city: site.city || '',
      cuisine_type: site.cuisine_type || '',
      is_vegan: site.is_vegan || false,
      is_gluten_free: site.is_gluten_free || false,
      is_halal: site.is_halal || false,
      active: site.active !== undefined ? site.active : true,
      province: site.province || '',
      region: site.region || '',
      country: site.country || '',
      lat: site.lat || 0,
      lon: site.lon || 0,
      score: site.score || 0,
      num_opinions: site.num_opinions || 0,
    });
    setNewImageUri(null);
  };

  const handleCancel = () => {
    if (hasChanges()) {
      Alert.alert(
        'Discard Changes',
        'Are you sure you want to discard your changes?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => {
              setIsEditing(false);
              setNewImageUri(null);
              handleEdit(); // Reset to original values
            },
          },
        ]
      );
    } else {
      setIsEditing(false);
      setNewImageUri(null);
    }
  };

  const hasChanges = () => {
    if (newImageUri) return true;
    if (!editedSite || !site) return false;
    
    return (
      editedSite.name !== (site.name || '') ||
      editedSite.description !== (site.description || '') ||
      editedSite.price !== (site.price || '') ||
      editedSite.contact !== (site.contact || '') ||
      editedSite.website !== (site.website || '') ||
      editedSite.street !== (site.street || '') ||
      editedSite.city !== (site.city || '') ||
      editedSite.cuisine_type !== (site.cuisine_type || '') ||
      editedSite.is_vegan !== (site.is_vegan || false) ||
      editedSite.is_gluten_free !== (site.is_gluten_free || false) ||
      editedSite.is_halal !== (site.is_halal || false) ||
      editedSite.active !== site.active
    );
  };

  const handleImagePicker = () => {
    Alert.alert(
      'Select Image Source',
      'Choose where to get the image from',
      [
        {
          text: 'Camera',
          onPress: () => pickImageFromCamera(),
        },
        {
          text: 'Gallery',
          onPress: () => pickImageFromGallery(),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const pickImageFromCamera = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setNewImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image from camera:', error);
      Alert.alert('Error', 'Failed to open camera');
    }
  };

  const pickImageFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setNewImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image from gallery:', error);
      Alert.alert('Error', 'Failed to open gallery');
    }
  };

  const uploadImage = async () => {
    if (!newImageUri) return true; // No new image to upload

    setUploadingImage(true);
    try {
      const response = await images.uploadSiteImage(siteId, newImageUri);
      
      if (response.status === 'success') {
        return true;
      } else {
        Alert.alert('Upload Failed', response.message || 'Failed to upload image');
        return false;
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Upload Failed', error.message || 'Failed to upload image');
      return false;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    // Validate required fields
    if (!editedSite?.name?.trim()) {
      Alert.alert('Error', 'Restaurant name is required');
      return;
    }

    setSaving(true);

    try {
      // Upload image first if there's a new one
      if (newImageUri) {
        // const imageUploadSuccess = await uploadImage();
        // if (!imageUploadSuccess) {
        //   setSaving(false);
        //   return;
        // }
      }

      // Update restaurant data
      const response = await sites.update(siteId, editedSite);
      
      if (response.status === 'success') {
        Alert.alert('Success', 'Restaurant updated successfully');
        
        // Refresh data from server
        await fetchSiteDetails();
        
        setIsEditing(false);
        setNewImageUri(null);
      } else {
        Alert.alert('Error', response.message || 'Failed to update restaurant');
      }
    } catch (err) {
      console.error('Error updating site:', err);
      Alert.alert('Error', err.message || 'Failed to update restaurant');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field, value) => {
    setEditedSite(prev => ({ ...prev, [field]: value }));
  };

  const openURL = (url) => {
    if (url) {
      Linking.openURL(url).catch(err => console.error('Error opening URL:', err));
    }
  };

  const callPhone = (phone) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`).catch(err => console.error('Error calling:', err));
    }
  };

  const formatSchedule = (schedule) => {
    if (!schedule?.weekly) return null;

    const dayOrder = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
    const dayNames = {
      mon: 'Monday',
      tue: 'Tuesday',
      wed: 'Wednesday',
      thu: 'Thursday',
      fri: 'Friday',
      sat: 'Saturday',
      sun: 'Sunday',
    };

    return dayOrder.map(day => {
      const times = schedule.weekly[day];
      if (!times || times.length === 0) {
        return { day: dayNames[day], hours: 'Closed' };
      }

      const hoursText = times.map(t => `${t.start} - ${t.end}`).join(', ');
      return { day: dayNames[day], hours: hoursText };
    });
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchSiteDetails} />;
  }

  if (!site) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Site not found</Text>
      </View>
    );
  }

  // Use site data if editedSite is not initialized yet
  const currentSite = (isEditing && editedSite) ? editedSite : site;
  const scheduleData = formatSchedule(site.opening_schedule);
  const displayImageUri = newImageUri || site.image?.path;

  return (
    <ScrollView style={styles.container}>
      {/* Header Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: displayImageUri }}
          style={styles.headerImage}
          defaultSource={require('../../assets/icon.png')}
        />
        {/* {isEditing && (
          <TouchableOpacity
            style={styles.changeImageButton}
            onPress={handleImagePicker}
          >
            <Ionicons name="camera" size={24} color="#FFF" />
            <Text style={styles.changeImageText}>Change Image</Text>
          </TouchableOpacity>
        )} */}
      </View>

      {/* Basic Info */}
      <View style={styles.section}>
        {isEditing ? (
          <>
            <Text style={styles.fieldLabel}>Restaurant Name *</Text>
            <TextInput
              style={styles.input}
              value={currentSite?.name || ''}
              onChangeText={(text) => updateField('name', text)}
              placeholder="Restaurant name"
            />
          </>
        ) : (
          <Text style={styles.siteName}>{currentSite?.name || 'No name'}</Text>
        )}
        
        {isEditing ? (
          <>
            <Text style={styles.fieldLabel}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={currentSite?.description || ''}
              onChangeText={(text) => updateField('description', text)}
              placeholder="Description"
              multiline
              numberOfLines={4}
            />
          </>
        ) : (
          currentSite?.description && (
            <Text style={styles.description}>{currentSite.description}</Text>
          )
        )}

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Ionicons name="star" size={20} color={COLORS.primary} />
            <Text style={styles.statValue}>{currentSite?.score || '0'}</Text>
            <Text style={styles.statLabel}>Score</Text>
          </View>

          <View style={styles.stat}>
            <Ionicons name="chatbubble-outline" size={20} color={COLORS.primary} />
            <Text style={styles.statValue}>{currentSite?.num_opinions || '0'}</Text>
            <Text style={styles.statLabel}>Reviews</Text>
          </View>

          <View style={styles.stat}>
            <Ionicons name="pricetag-outline" size={20} color={COLORS.primary} />
            {isEditing ? (
              <TextInput
                style={[styles.input, styles.smallInput]}
                value={currentSite?.price || ''}
                onChangeText={(text) => updateField('price', text)}
                placeholder="10-20€"
              />
            ) : (
              <Text style={styles.statValue}>{currentSite?.price || 'N/A'}</Text>
            )}
            <Text style={styles.statLabel}>Price</Text>
          </View>
        </View>
      </View>

      {/* Dietary Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dietary Options</Text>
        <View style={styles.dietaryContainer}>
          <View style={styles.dietaryRow}>
            <View style={styles.dietaryBadge}>
              <Ionicons name="leaf-outline" size={16} color="#4CAF50" />
              <Text style={styles.dietaryText}>Vegan</Text>
            </View>
            {isEditing && (
              <Switch
                value={currentSite?.is_vegan || false}
                onValueChange={(value) => updateField('is_vegan', value)}
                trackColor={{ false: '#767577', true: '#4CAF50' }}
              />
            )}
          </View>

          <View style={styles.dietaryRow}>
            <View style={styles.dietaryBadge}>
              <Ionicons name="nutrition-outline" size={16} color="#FF9800" />
              <Text style={styles.dietaryText}>Gluten Free</Text>
            </View>
            {isEditing && (
              <Switch
                value={currentSite?.is_gluten_free || false}
                onValueChange={(value) => updateField('is_gluten_free', value)}
                trackColor={{ false: '#767577', true: '#FF9800' }}
              />
            )}
          </View>

          <View style={styles.dietaryRow}>
            <View style={styles.dietaryBadge}>
              <Ionicons name="checkmark-circle-outline" size={16} color="#2196F3" />
              <Text style={styles.dietaryText}>Halal</Text>
            </View>
            {isEditing && (
              <Switch
                value={currentSite?.is_halal || false}
                onValueChange={(value) => updateField('is_halal', value)}
                trackColor={{ false: '#767577', true: '#2196F3' }}
              />
            )}
          </View>
        </View>
      </View>

      {/* Contact Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Information</Text>
        
        {isEditing ? (
          <>
            <Text style={styles.fieldLabel}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={currentSite?.contact || ''}
              onChangeText={(text) => updateField('contact', text)}
              placeholder="+34 123456789"
              keyboardType="phone-pad"
            />

            <Text style={styles.fieldLabel}>Website</Text>
            <TextInput
              style={styles.input}
              value={currentSite?.website || ''}
              onChangeText={(text) => updateField('website', text)}
              placeholder="https://example.com"
              keyboardType="url"
              autoCapitalize="none"
            />
          </>
        ) : (
          <>
            {currentSite?.contact && (
              <TouchableOpacity 
                style={styles.contactItem}
                onPress={() => callPhone(currentSite.contact)}
              >
                <Ionicons name="call-outline" size={20} color={COLORS.primary} />
                <Text style={styles.contactText}>{currentSite.contact}</Text>
              </TouchableOpacity>
            )}

            {currentSite?.website && (
              <TouchableOpacity 
                style={styles.contactItem}
                onPress={() => openURL(currentSite.website)}
              >
                <Ionicons name="globe-outline" size={20} color={COLORS.primary} />
                <Text style={styles.contactText}>{currentSite.website}</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>

      {/* Location */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Location</Text>
        
        {isEditing ? (
          <>
            <Text style={styles.fieldLabel}>Street Address</Text>
            <TextInput
              style={styles.input}
              value={currentSite?.street || ''}
              onChangeText={(text) => updateField('street', text)}
              placeholder="Street address"
            />

            <Text style={styles.fieldLabel}>City</Text>
            <TextInput
              style={styles.input}
              value={currentSite?.city || ''}
              onChangeText={(text) => updateField('city', text)}
              placeholder="City"
            />

            <Text style={styles.fieldLabel}>Cuisine Type</Text>
            <TextInput
              style={styles.input}
              value={currentSite?.cuisine_type || ''}
              onChangeText={(text) => updateField('cuisine_type', text)}
              placeholder="mediterranean, italian, etc."
              autoCapitalize="none"
            />
          </>
        ) : (
          <>
            <View style={styles.locationItem}>
              <Ionicons name="location-outline" size={20} color={COLORS.primary} />
              <View style={styles.locationInfo}>
                <Text style={styles.locationText}>{site?.street || 'No address'}</Text>
                <Text style={styles.locationSubtext}>
                  {site?.city || ''}{site?.province ? `, ${site.province}` : ''}{site?.region ? `, ${site.region}` : ''}
                </Text>
                <Text style={styles.locationSubtext}>
                  {site?.country || ''}{site?.cuisine_type ? ` • ${site.cuisine_type}` : ''}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.mapButton}
              onPress={() => openURL(`https://maps.google.com/?q=${site?.lat || 0},${site?.lon || 0}`)}
            >
              <Ionicons name="map-outline" size={20} color="#FFF" />
              <Text style={styles.mapButtonText}>Open in Maps</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Hashtags - View Only */}
      {!isEditing && site.hashtags && site.hashtags.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <View style={styles.hashtagsContainer}>
            {site.hashtags.map((tag, index) => (
              <View key={index} style={styles.hashtag}>
                <Text style={styles.hashtagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Opening Schedule - View Only */}
      {!isEditing && scheduleData && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Opening Hours</Text>
          {site.opening_schedule?.timezone && (
            <Text style={styles.timezoneText}>
              Timezone: {site.opening_schedule.timezone}
            </Text>
          )}
          {scheduleData.map((item, index) => (
            <View key={index} style={styles.scheduleItem}>
              <Text style={styles.scheduleDay}>{item.day}</Text>
              <Text style={styles.scheduleHours}>{item.hours}</Text>
            </View>
          ))}
          
          {site.opening_schedule?.exceptions && site.opening_schedule.exceptions.length > 0 && (
            <View style={styles.exceptionsContainer}>
              <Text style={styles.exceptionsTitle}>Exceptions:</Text>
              {site.opening_schedule.exceptions.map((exc, index) => (
                <Text key={index} style={styles.exceptionText}>
                  {exc.date}: {exc.closed ? 'Closed' : 'Special hours'}
                </Text>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Social Media - View Only */}
      {!isEditing && site.social_media && site.social_media.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Social Media</Text>
          {site.social_media.map((social, index) => (
            <TouchableOpacity
              key={index}
              style={styles.socialItem}
              onPress={() => openURL(social.link)}
            >
              <Ionicons 
                name={social.source === 'tiktok' ? 'logo-tiktok' : 'link-outline'} 
                size={20} 
                color={COLORS.primary} 
              />
              <Text style={styles.socialText}>
                {social.source} - @{social.author}
              </Text>
              <Ionicons name="open-outline" size={16} color="#999" />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Status</Text>
        <View style={styles.statusRow}>
          <View style={[styles.statusBadge, currentSite?.active ? styles.statusActive : styles.statusInactive]}>
            <Text style={styles.statusText}>
              {currentSite?.active ? 'Active' : 'Inactive'}
            </Text>
          </View>
          {isEditing && (
            <Switch
              value={currentSite?.active || false}
              onValueChange={(value) => updateField('active', value)}
              trackColor={{ false: '#767577', true: COLORS.primary }}
            />
          )}
        </View>
      </View>

      {/* Save/Cancel Buttons */}
      {isEditing && (
        <View style={styles.section}>
          <View style={styles.buttonsRow}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleCancel}
              disabled={saving || uploadingImage}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}
              disabled={saving || uploadingImage}
            >
              {saving || uploadingImage ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.saveButtonText}>
                  {newImageUri ? 'Save & Upload' : 'Save Changes'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
          {uploadingImage && (
            <Text style={styles.uploadingText}>Uploading image...</Text>
          )}
        </View>
      )}

      {/* Bottom Padding */}
      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  imageContainer: {
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: 250,
    backgroundColor: '#E0E0E0',
  },
  changeImageButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  changeImageText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#FFF',
    padding: 16,
    marginTop: 1,
  },
  siteName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 8,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  smallInput: {
    width: 80,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 0,
  },
  dietaryContainer: {
    gap: 12,
  },
  dietaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dietaryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: COLORS.background,
    borderRadius: 20,
  },
  dietaryText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  contactText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
  },
  locationItem: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  locationInfo: {
    flex: 1,
  },
  locationText: {
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 4,
  },
  locationSubtext: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 8,
  },
  mapButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  hashtagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  hashtag: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  hashtagText: {
    fontSize: 14,
    color: COLORS.primary,
  },
  timezoneText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 12,
  },
  scheduleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  scheduleDay: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  scheduleHours: {
    fontSize: 15,
    color: '#666',
    flex: 2,
  },
  exceptionsContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#FFF9E6',
    borderRadius: 8,
  },
  exceptionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
  },
  exceptionText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  socialItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  socialText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusActive: {
    backgroundColor: '#E8F5E9',
  },
  statusInactive: {
    backgroundColor: '#FFEBEE',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cancelButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: COLORS.primary,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  uploadingText: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  bottomPadding: {
    height: 32,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.error,
    textAlign: 'center',
    marginTop: 32,
  },
});

export default SiteDetailsScreen;