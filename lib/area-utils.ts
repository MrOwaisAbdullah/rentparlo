/**
 * =====================================================
 * RentParlo.pk Area Utility Functions
 * =====================================================
 * Utility functions for managing city and area data with caching
 */

// Pakistani cities and areas for location data
export const CITY_AREAS: Record<string, string[]> = {
  'Karachi': [
    'DHA', 'Clifton', 'Gulshan-e-Iqbal', 'Gulistan-e-Jauhar', 'North Nazimabad',
    'Malir', 'Bahria Town Karachi', 'Saddar', 'Korangi', 'Nazimabad',
    'Shah Faisal Colony', 'Scheme 33', 'Orangi Town', 'Landhi', 'Gadap Town',
    'Liaquatabad', 'Jamshed Town', 'Federal B. Area', 'Buffer Zone', 'North Karachi',
    'Bin Qasim Town', 'Lyari', 'Baldia Town', 'SITE Town', 'New Karachi',
    'Shahrah-e-Faisal', 'M.A. Jinnah Road', 'I.I. Chundrigar Road', 'Burns Road',
    'PECHS', 'Tariq Road', 'Soldier Bazaar', 'Garden East', 'Garden West',
    'Karimabad', 'Lalukhet', 'Paposh Nagar', 'Haidery', 'Surjani Town',
    'Mehmoodabad', 'Khudadad Colony', 'Model Colony', 'Drigh Road', 'Kharadar',
    'Mithadar', 'Sohrab Goth', 'Manzoor Colony', 'Kemari', 'Defence View',
    'Saadi Town', 'Gulshan-e-Maymar', 'Manghopir', 'S.I.T.E. Industrial Area',
    'Safoora Goth', 'Ahsanabad', 'Bilal Colony'
  ],
  'Lahore': [
    'Gulberg', 'Model Town', 'Johar Town', 'DHA', 'Cantt', 'Garden Town',
    'Bahria Town', 'Wapda Town', 'Raiwind Road', 'Ferozepur Road', 'Thokar Niaz Baig',
    'Allama Iqbal Town', 'Samanabad', 'Shadbagh', 'Mughalpura', 'Garhi Shahu',
    'Ichhra', 'Faisal Town', 'Punjab Cooperative Housing Society', 'New Muslim Town',
    'Township', 'Kot Lakhpat', 'Cavalry Ground', 'Dharampura', 'Badami Bagh',
    'Old Anarkali', 'Shahdara', 'Baghbanpura', 'Data Darbar', 'G.T. Road',
    'Bund Road', 'Shalimar Town', 'Islampura', 'Tajpura', 'Defence Road'
  ],
  'Islamabad': [
    'F-7', 'F-8', 'F-10', 'F-11', 'Blue Area', 'G-9', 'G-10', 'E-11',
    'DHA Phase 2', 'Bahria Town', 'Bani Gala', 'G-13', 'I-8', 'I-9', 'I-10',
    'I-11', 'H-9', 'H-10', 'H-11', 'Rawal Town', 'P.W.D. Housing Society',
    'Media Town', 'Soan Garden', 'Chak Shahzad', 'Golra', 'Sector D-12',
    'Sector E-7', 'Bara Kahu', 'Malpur', 'Jinnah Avenue', 'Margalla Road'
  ],
  'Rawalpindi': [
    'Saddar', 'Commercial Market', 'Cantt', 'Committee Chowk', 'Adiala Road',
    'Chaklala Scheme III', 'Bahria Town', 'Peshawar Road', 'Murree Road',
    'Airport Road', 'Shamsabad', 'Satellite Town', 'Dhoke Saydan', 'Dhoke Khabba',
    'Gulzar-e-Quaid', 'Westridge', 'Lalazar', 'Saidpur Road'
  ],
  'Faisalabad': [
    'Civil Lines', 'Peoples Colony', 'Susan Road', 'Kohinoor City', 'Sattiana Road',
    'Samundri Road', 'Jhang Road', 'Jaranwala Road', 'Canal Road', 'Millat Town',
    'Ghulam Muhammadabad', 'D-Type Colony', 'Madina Town', 'Sadaqat Colony', 'Ayub Colony'
  ],
  'Multan': [
    'Cantt', 'Gulgasht', 'Shah Rukn-e-Alam', 'Wapda Town', 'Bosan Road', 'Jalilabad',
    'DHA', 'Lohari Gate', 'Chungi No. 9', 'Mumtazabad', 'New Multan', 'Qasim Bagh Colony'
  ],
  'Peshawar': [
    'University Town', 'Hayatabad', 'Saddar', 'Gulbahar', 'Dalazak Road', 'Ring Road',
    'Shami Road', 'Firdous Road', 'Sardheri', 'Board Bazaar', 'Dabgari Garden', 'Khyber Super Market'
  ],
  'Quetta': [
    'Cantt', 'Satellite Town', 'Jinnah Town', 'Sariab Road', 'Brewery Road',
    'Joint Road', 'Kasi Road', 'Kachra Road', 'Shahbaz Town', 'Arbab Town', 'Soran'
  ],
  'Sialkot': [
    'Cantt', 'Paris Road', 'Kashmir Road', 'Defence Road', 'Wazirabad Road',
    'Pasrur Road', 'Marala Road', 'Sambrial', 'Daska Road', 'Gohadpur', 'Shabbir Town'
  ],
  'Gujranwala': [
    'Cantt', 'Civil Lines', 'Satellite Town', 'GT Road', 'Model Town', 'DHA',
    'Wapda Town', 'Peoples Colony', 'Faisal Town', 'N Block'
  ],
  'Hyderabad': ['Latifabad', 'Qasimabad', 'Saddar', 'Phuleli', 'Citizen Colony', 'Hirabad', 'Kotri'],
  'Bahawalpur': ['Model Town A', 'Model Town B', 'Sadiq Colony', 'Satellite Town', 'Lal Sohanra', 'DHA'],
  'Sargodha': ['Satellite Town', 'Faisalabad Road', 'Lahore Road', 'Cantt', 'Kot Fareed', 'Bhalwal'],
  'Sukkur': ['Barrage Road', 'Military Road', 'Shikarpur Road', 'Sindh Industrial Trading Estate (SITE)', 'Minara Road'],
  'Larkana': ['Civil Lines', 'Saddar', 'Naudero', 'Ratodero', 'Nazar Mohalla'],
  'Rahim Yar Khan': ['Satellite Town', 'Model Town', 'Faisal Colony', 'Gulshan Iqbal Colony', 'DHA'],
  'Kasur': ['Kot Murad Khan', 'Raja Jang', 'Basti Khuda Bakhsh', 'Phool Nagar', 'Khudian'],
  'Sheikhupura': ['Mominpura', 'Manawala', 'G.T. Road', 'Civil Lines'],
  'Jhang': ['Satellite Town', 'Civil Lines', 'Shorkot Road', 'Kot Khadim Ali'],
  'Dera Ghazi Khan': ['Model Town', 'Bosan Road', 'Indus Highway', 'Saddar'],
  'Gujrat': ['Civil Lines', 'G.T. Road', 'Jalalpur Jattan', 'Sargodha Road', 'Faisalabad Road'],
  'Sahiwal': ['Farid Town', 'High Street', 'G.T. Road', 'Civil Lines', 'Jail Road'],
  'Okara': ['Saddar Bazaar', 'Hujra Shah Muqeem', 'Depalpur', 'Renala Khurd'],
  'Muzaffargarh': ['Jatoi Road', 'Kot Addu', 'Alipur', 'Qureshi Road'],
  'Nawabshah': ['Mohni Bazaar', 'Sakrand Road', 'Qazi Ahmed', 'Liaquat Colony'],
  'Mirpur Khas': ['Satellite Town', 'New Town', 'Hirabad', 'Jail Road'],
  'Jacobabad': ['Cantonment', 'Saddar', 'Thull', 'Ghouspur'],
  'Mardan': ['Par Hoti', 'Gulberg', 'Rustam', 'Bank Road'],
  'Kohat': ['Jangal Khel', 'Togh Bala', 'Khattak Colony', 'Bahadur Kot'],
  'Abbottabad': ['Jinnahabad', 'Cantonment', 'Mansehra Road', 'Murree Road', 'Nawansher'],
  'Dera Ismail Khan': ['Chota Bazar', 'Circular Road', 'Saddar', 'Darya Khan', 'North Circular Road'],
  'Bannu': ['Miryan', 'Gali Khel', 'Lakki Marwat Road', 'Indus Highway'],
  'Swabi': ['Topi', 'Jandool', 'Shewa Adda', 'Kotha'],
  'Nowshera': ['Pabbi', 'Risalpur', 'Azakhel', 'Jehangira'],
  'Charsadda': ['Tangi', 'Peshawar Road', 'Shabqadar', 'Turangzai'],
  'Tank': ['Dera Ismail Khan Road', 'Kot Azam', 'Saddar', 'Jandola'],
  'Hangu': ['Doaba', 'Tall', 'Saddar', 'Shamalai'],
  'Buner': ['Daggar', 'Ambela', 'Gadezai', 'Swari'],
  'Malakand': ['Batkhela', 'Dargai', 'Khar', 'Thana'],
  'Swat': ['Mingora', 'Saidu Sharif', 'Kabal', 'Madyan', 'Behrain'],
  'Chitral': ['Boonee', 'Drosh', 'Mastuj', 'Garam Chashma'],
  'Haripur': ['Kot Najeebullah', 'Taxila Road', 'Khalabat Township', 'Khanpur'],
  'Mansehra': ['Gali Bagh', 'Lassan Nawab', 'Siri Kot', 'Shinkiari'],
  'Karak': ['Banda Daud Shah', 'Teri', 'Latambar', 'Chak Shawa'],
  'Kurram': ['Parachinar', 'Sadda', 'Alizai', 'Dogar'],
  'North Waziristan': ['Miramshah', 'Razmak', 'Datta Khel', 'Danday Darpa Khel'],
  'South Waziristan': ['Wana', 'Sararogha', 'Ladha', 'Makeen'],
  'Khyber': ['Jamrud', 'Landi Kotal', 'Torkham', 'Ali Masjid'],
  'Orakzai': ['Kalaya', 'Ferozkhel', 'Ghuz Gurgai', 'Hangu Road'],
  'Harnai': ['Shahrag', 'Harnai Bazaar', 'Zardalu'],
  'Ziarat': ['Kharwari Baba', 'Kwas', 'Chautair', 'Zizri'],
  'Khuzdar': ['Wadh', 'Mula', 'Nal', 'Sassol'],
  'Turbat': ['Gwadar Road', 'Hoshab', 'Balochabad', 'Kech River Road'],
  'Panjgur': ['Gichk', 'Pahr', 'Chathkan'],
  'Kech': ['Turbat', 'Buleda', 'Tump', 'Mund'],
  'Dera Bugti': ['Sui', 'Dolat Khan', 'Pirkoh', 'Mazarani'],
  'Nasirabad': ['Dera Murad Jamali', 'Tamboo', 'Sial', 'Ghulam Hussain'],
  'Jaffarabad': ['Jhat Pat', 'Gandakha', 'Osta Muhammad', 'Dera Allah Yar'],
  'Sibi': ['Sibi City', 'Lehri', 'Kutmandai'],
  'Bolan': ['Mach', 'Kirani', 'Sibi Road', 'Jhal Magsi'],
  'Qilla Abdullah': ['Chaman', 'Gulistan', 'Daman', 'Toba Achakzai'],
  'Pishin': ['Huramzai', 'Soran', 'Barshor', 'Killa Abdullah Road'],
  'Chagai': ['Dalbandin', 'Nushki', 'Taftan', 'Ahmed Wal'],
  'Kharan': ['Sarawan', 'Khorasan', 'Washuk', 'Nok Chah'],
  'Washuk': ['Mashkhel', 'Rakhshan', 'Shadi Khel'],
  'Awaran': ['Awaran City', 'Jhal Jao', 'Mashkai'],
  'Gwadar': ['Gwadar Port', 'Pishukan', 'Surbandar', 'Jiwani'],
  'Lasbela': ['Bela', 'Sonmiani', 'Uthal', 'Hub'],
  'Kalat': ['Surab', 'Manguchar', 'Tirandaz', 'Kalat Fort'],
  'Mastung': ['Shori', 'Khad Koocha', 'Kirdgap', 'Kanbakar'],
  'Duki': ['Sanjaavi', 'Duki City', 'Nawai', 'Sargaro'],
  'Loralai': ['Dukki', 'Marghzak', 'Bori', 'Mekhtar'],
  'Musakhel': ['Kingri', 'Musakhel City', 'Drug'],
  'Barkhan': ['Chhapar', 'Bhalar', 'Jand'],
  'Dera Murad Jamali': ['Tamboo', 'Manjhoo Shori', 'Sohbatpur'],
  'Jhal Magsi': ['Gajja', 'Jhal Magsi City', 'Gandawa'],
  'Sohbatpur': ['Sohbatpur City', 'Farahabad', 'Manjhoo Shori'],
  'Kachhi': ['Bolan', 'Mithri', 'Sann', 'Bhag'],
  'Jafarabad': ['Usta Muhammad', 'Dera Allah Yar', 'Gandakha'],
  'Umerkot': ['Pithoro', 'Chhor', 'Samaro'],
  'Tharparkar': ['Mithi', 'Nagarparkar', 'Islamkot'],
  'Badin': ['Tando Bago', 'Talhar', 'Golarchi'],
  'Thatta': ['Makli', 'Gharo', 'Sujawal'],
  'Jamshoro': ['Kotri', 'Sann', 'Nooriabad', 'Sehwan Sharif'],
  'Tando Allahyar': ['Tando Allahyar City', 'Chamber', 'Nasarpur'],
  'Tando Muhammad Khan': ['Bulri Shah Karim', 'Tando Ghulam Hyder', 'Pangrio'],
  'Sanghar': ['Tando Adam', 'Shahdadpur', 'Khipro'],
  'Dadu': ['Mehar', 'Johi', 'Bhan Saeedabad'],
  'Kambar Shahdadkot': ['Kambar', 'Shahdadkot', 'Mirokhan'],
  'Qambar Shahdadkot': ['Qambar', 'Shahdadkot', 'Dokri'],
  'Shikarpur': ['Lakhi Ghulam Shah', 'Garhi Yasin', 'Sultan Kot'],
  'Naushahro Firoz': ['Moro', 'Kandiaro', 'Bhiria'],
  'Khairpur': ['Kot Diji', 'Ranipur', 'Faiz Ganj'],
  'Kashmore': ['Kandhkot', 'Tangwani', 'Guddu'],
  'Sujawal': ['Shah Bandar', 'Jati', 'Tando Hafiz Shah'],
  'Gilgit': ['Jutial', 'Saddar', 'Konodas', 'Barmas', 'Basin'],
  'Skardu': ['Saddar Bazaar', 'Ganga Chashma', 'Hussainabad'],
  'Muzaffarabad': ['Saddar', 'Upper Plate', 'Neelum Road', 'Jhelum Valley'],
  'Mirpur': ['Mangla', 'Dadyal', 'Kotli Road', 'Allama Iqbal Road'],
  'Rawalakot': ['Khamba', 'Dhal Jar', 'Hajira Road', 'Thorar'],
  'Kotli': ['Dhal Jar', 'Nakyal', 'Sehnsa', 'Chakswari']
};

// Simple in-memory cache for area data
const areaCache = new Map<string, any>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CacheItem {
  data: any;
  timestamp: number;
}

/**
 * Get areas for a given city
 * @param city - The city name
 * @returns Array of areas for the city, or empty array if city not found
 */
export function getAreasForCity(city: string): string[] {
  const cacheKey = `areas_${city}`;
  const cached = areaCache.get(cacheKey);
  
  // Check if we have valid cached data
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  
  const areas = CITY_AREAS[city] || [];
  
  // Cache the result
  areaCache.set(cacheKey, {
    data: areas,
    timestamp: Date.now()
  });
  
  return areas;
}

/**
 * Check if a city has defined areas
 * @param city - The city name
 * @returns True if the city has defined areas, false otherwise
 */
export function hasAreas(city: string): boolean {
  const cacheKey = `has_areas_${city}`;
  const cached = areaCache.get(cacheKey);
  
  // Check if we have valid cached data
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  
  const result = !!CITY_AREAS[city] && CITY_AREAS[city].length > 0;
  
  // Cache the result
  areaCache.set(cacheKey, {
    data: result,
    timestamp: Date.now()
  });
  
  return result;
}

/**
 * Get all cities that have defined areas
 * @returns Array of city names that have areas defined
 */
export function getCitiesWithAreas(): string[] {
  const cacheKey = 'cities_with_areas';
  const cached = areaCache.get(cacheKey);
  
  // Check if we have valid cached data
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  
  const cities = Object.keys(CITY_AREAS);
  
  // Cache the result
  areaCache.set(cacheKey, {
    data: cities,
    timestamp: Date.now()
  });
  
  return cities;
}

/**
 * Get all unique areas across all cities
 * @returns Array of all unique area names
 */
export function getAllAreas(): string[] {
  const cacheKey = 'all_areas';
  const cached = areaCache.get(cacheKey);
  
  // Check if we have valid cached data
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  
  const allAreas = new Set<string>();
  Object.values(CITY_AREAS).forEach(areas => {
    areas.forEach(area => allAreas.add(area));
  });
  const result = Array.from(allAreas).sort();
  
  // Cache the result
  areaCache.set(cacheKey, {
    data: result,
    timestamp: Date.now()
  });
  
  return result;
}

/**
 * Clear the area cache
 */
export function clearAreaCache(): void {
  areaCache.clear();
}

export default {
  CITY_AREAS,
  getAreasForCity,
  hasAreas,
  getCitiesWithAreas,
  getAllAreas,
  clearAreaCache
};