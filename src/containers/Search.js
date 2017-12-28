'use strict';
import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  TextInput,
  View,
  Button,
  ActivityIndicator,
  Image
} from 'react-native';

class Search extends Component<{}>{
  render(){
    return(
      <View style={styles.container}>
        <Text style={styles.description}>
          Search for washrooms!
        </Text>
        <Text style={styles.description}>
         Search by building!
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  description: {
    marginBottom: 20,
    fontSize: 18,
    textAlign: 'center',
    color: #656565
  },
  container: {
    padding: 30,
    marginTop: 65,
    alignItems:
  }
});
export default Search;
