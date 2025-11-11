import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  // …any other RN primitives you need
} from 'react-native';

// 1. If you need props, define an interface:
interface MyScreenProps {
  someParam?: string;
  // …
}

// 2. Then write your function as a React.FC or plain function:
const Card: React.FC<MyScreenProps> = ({ someParam }) => {
  const [foo, setFoo] = useState<number>(0);

  useEffect(() => {
    // any effect on mount or on foo changes…
  }, [foo]);

  // 3. Render a tree of <View>, <Text>, etc.
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hello, {someParam}</Text>
      {/* … */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFF',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
});

export default Card;
