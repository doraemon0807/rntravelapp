import { StatusBar } from "expo-status-bar";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { theme } from "./colors";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Fontisto } from "@expo/vector-icons";
import { Octicons } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";

const STORAGE_KEY = "@toDo";
const WORKING_KEY = "@working";

export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [toDos, setToDos] = useState({});
  const [loading, setLoading] = useState(false);
  const [editValue, setEditValue] = useState("");

  const travel = () => {
    setWorking(false);
    saveWorking(false);
  };
  const work = () => {
    setWorking(true);
    saveWorking(true);
  };

  const onChangeText = (payload) => {
    setText(payload);
  };

  const onEditText = (payload) => {
    setEditValue(payload);
  };

  const addToDo = async () => {
    if (text === "") return;

    // const newToDos = Object.assign({}, toDos, {
    //   [Date.now()]: { text, work: working },
    // });

    const newToDos = {
      ...toDos,
      [Date.now()]: { text, working, completed: false, editing: false },
    };

    setToDos(newToDos);
    await saveToDos(newToDos);
    setText("");
  };

  const saveToDos = async (toSave) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (e) {
      console.log(e);
    }
  };

  const loadToDos = async () => {
    try {
      const s = await AsyncStorage.getItem(STORAGE_KEY);
      return s != null ? setToDos(JSON.parse(s)) : null;
    } catch (e) {
      console.log(e);
    }
  };

  const deleteToDos = async (key) => {
    if (Platform.OS === "web") {
      const ok = confirm("Do you want to delete this item?");
      if (ok) {
        const newToDos = { ...toDos };
        delete newToDos[key];
        setToDos(newToDos);
        await saveToDos(newToDos);
      }
    } else {
      Alert.alert("Delete This Item?", "Are you sure?", [
        {
          text: "Cancel",
        },
        {
          text: "Yes",
          onPress: async () => {
            const newToDos = { ...toDos };
            delete newToDos[key];
            setToDos(newToDos);
            await saveToDos(newToDos);
          },
        },
      ]);
    }
  };

  const editToDoStart = (key) => {
    const newToDos = { ...toDos };
    newToDos[key].editing = true;
    setEditValue(newToDos[key].text);
    setToDos(newToDos);
  };

  const editToDoSubmit = async (key) => {
    const newToDos = { ...toDos };
    newToDos[key].text = editValue;
    newToDos[key].editing = false;
    setToDos(newToDos);
    await saveToDos(newToDos);
  };

  const editToDoCancel = (key) => {
    const newToDos = { ...toDos };
    newToDos[key].editing = false;
    setToDos(newToDos);
  };

  const toggleCompletedToDos = async (key) => {
    const newToDos = { ...toDos };
    newToDos[key].completed = !newToDos[key].completed;
    setToDos(newToDos);
    await saveToDos(newToDos);
  };

  const saveWorking = async (work) => {
    try {
      await AsyncStorage.setItem(WORKING_KEY, JSON.stringify({ work }));
    } catch (e) {
      console.log(e);
    }
  };

  const loadWorking = async () => {
    try {
      const s = await AsyncStorage.getItem(WORKING_KEY);
      return s != null ? setWorking(JSON.parse(s)["work"]) : null;
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadToDos();
    loadWorking();
    setLoading(false);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text
            style={{ ...styles.btnText, color: working ? "white" : theme.gray }}
          >
            Work
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text
            style={{ ...styles.btnText, color: working ? theme.gray : "white" }}
          >
            Travel
          </Text>
        </TouchableOpacity>
      </View>
      <View>
        <TextInput
          value={text}
          returnKeyType="done"
          onChangeText={onChangeText}
          onSubmitEditing={addToDo}
          placeholder={
            working ? "What do you have to do?" : "Where do you want to go?"
          }
          style={styles.input}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <ScrollView>
          {Object.keys(toDos).map((key) =>
            toDos[key].working === working ? (
              toDos[key].editing ? (
                <View style={styles.toDo} key={key}>
                  <TextInput
                    multiline
                    style={styles.editTextInput}
                    value={editValue}
                    onChangeText={onEditText}
                  />
                  <View style={styles.toDoBtns}>
                    <TouchableOpacity
                      style={styles.toDoBtn}
                      hitSlop={10}
                      onPress={() => editToDoSubmit(key)}
                    >
                      <MaterialIcons
                        name="check-circle"
                        size={18}
                        color={theme.gray}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.toDoBtn}
                      hitSlop={10}
                      onPress={() => editToDoCancel(key)}
                    >
                      <MaterialIcons
                        name="cancel"
                        size={18}
                        color={theme.gray}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.toDo} key={key}>
                  <Text
                    style={{
                      ...styles.toDoText,
                      textDecorationLine: toDos[key].completed
                        ? "line-through"
                        : "none",
                      color: toDos[key].completed ? theme.gray : "white",
                    }}
                  >
                    {toDos[key].text}
                  </Text>
                  <View style={styles.toDoBtns}>
                    <TouchableOpacity
                      style={styles.toDoBtn}
                      hitSlop={10}
                      onPress={() => toggleCompletedToDos(key)}
                    >
                      {toDos[key].completed ? (
                        <MaterialIcons
                          name="check-box"
                          size={18}
                          color={theme.gray}
                        />
                      ) : (
                        <MaterialIcons
                          name="check-box-outline-blank"
                          size={18}
                          color={theme.gray}
                        />
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.toDoBtn}
                      hitSlop={10}
                      onPress={() => editToDoStart(key)}
                    >
                      <Octicons name="pencil" size={18} color={theme.gray} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.toDoBtn}
                      hitSlop={10}
                      onPress={() => deleteToDos(key)}
                    >
                      <Fontisto name="trash" size={18} color={theme.gray} />
                    </TouchableOpacity>
                  </View>
                </View>
              )
            ) : null
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
  header: {
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop: 100,
  },
  btnText: {
    fontSize: 38,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "white",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginVertical: 20,
    fontSize: 18,
  },
  toDo: {
    backgroundColor: theme.toDoBg,
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toDoText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
    flex: 2,
  },
  toDoBtns: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    flex: 1,
  },
  toDoBtn: {
    marginLeft: 15,
  },
  editTextInput: {
    color: "white",
    flex: 2,
    backgroundColor: "rgba(160,160,160,1)",
    borderRadius: 20,
    padding: 5,
  },
});
