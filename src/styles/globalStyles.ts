import { StyleSheet } from 'react-native';

export const globalStyles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  safeArea: { 
    flex: 1 
  },
  
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 16, 
    paddingVertical: 12 
  },
  headerTitle: { 
    fontSize: 24, 
    fontWeight: 'bold' 
  },
  headerButton: { 
    padding: 8, 
    borderRadius: 20, 
    minWidth: 40, 
    alignItems: 'center' 
  },
  headerButtonText: { 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
  
  searchContainer: { 
    paddingHorizontal: 16, 
    paddingVertical: 8 
  },
  searchInput: { 
    borderWidth: 1, 
    borderRadius: 25, 
    paddingHorizontal: 16, 
    paddingVertical: 12, 
    fontSize: 16 
  },
  filterContainer: { 
    paddingHorizontal: 16, 
    paddingVertical: 8 
  },
  filterScrollView: { 
    paddingVertical: 4 
  },
  filterButton: { 
    paddingHorizontal: 16, 
    paddingVertical: 8, 
    borderRadius: 20, 
    marginRight: 8, 
    borderWidth: 1 
  },
  filterButtonText: { 
    fontSize: 14, 
    fontWeight: '500' 
  },
  
  gridContainer: { 
    paddingHorizontal: 16,
    alignItems: 'center'
  },
  
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  fabText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  
  modalContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: 'rgba(0,0,0,0.5)' 
  },
  modalView: { 
    width: '80%', 
    backgroundColor: 'white', 
    borderRadius: 20, 
    padding: 35, 
    alignItems: 'center', 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.25, 
    shadowRadius: 4, 
    elevation: 5, 
    gap: 15 
  },
  modalText: { 
    fontSize: 20, 
    marginBottom: 5, 
    textAlign: 'center', 
    fontWeight: 'bold' 
  },
  modalSubtext: { 
    fontSize: 14, 
    color: '#666', 
    marginBottom: 10, 
    textAlign: 'center' 
  },
  modalInput: { 
    width: '100%', 
    borderColor: '#ccc', 
    borderWidth: 1, 
    padding: 10, 
    borderRadius: 5, 
    textAlign: 'center', 
    fontSize: 20 
  },
  modalButtonContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    width: '100%', 
    marginTop: 10 
  },
  
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  body: {
    fontSize: 16,
  },
  caption: {
    fontSize: 14,
  },
  small: {
    fontSize: 12,
  },

  input: {
    height: 40,
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
});