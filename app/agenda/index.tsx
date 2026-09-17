import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    Animated,
    Easing,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const MONTHS_SHORT = [
  "jan.",
  "fev.",
  "mar.",
  "abr.",
  "mai.",
  "jun.",
  "jul.",
  "ago.",
  "set.",
  "out.",
  "nov.",
  "dez.",
];

const WEEK_DAYS_SHORT = [
  "dom.",
  "seg.",
  "ter.",
  "qua.",
  "qui.",
  "sex.",
  "sáb.",
];
const WEEK_DAYS = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];

const HOLIDAYS_2026: { [key: string]: string } = {
  "9-12": "Nossa Senhora Aparecida",
  "10-2": "Finados",
  "10-15": "Proclamação da República",
  "10-20": "Consciência Negra",
  "11-25": "Natal",
};

interface NotificationItem {
  id: string;
  title: string;
  day: number;
  monthIndex: number;
  year: number;
  hour: string;
  minute: string;
  timestamp: number;
}

const STORAGE_KEY = "agenda_notifications_by_date";

export default function AgendaScreen() {
  const router = useRouter();
  const [currentMonthIndex, setCurrentMonthIndex] = useState(8);
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalStep, setModalStep] = useState<
    | "confirm"
    | "options"
    | "createNotification"
    | "loading"
    | "success"
    | "manageList"
  >("confirm");

  const [notifications, setNotifications] = useState<
    Record<string, NotificationItem[]>
  >({});

  const [notifDate, setNotifDate] = useState({
    day: 17,
    monthIndex: 8,
    year: 2026,
  });
  const [notifHour, setNotifHour] = useState("00");
  const [notifMinute, setNotifMinute] = useState("00");

  const [pickerMode, setPickerMode] = useState<"calendar" | "time" | null>(
    null,
  );
  const [tempCalendarMonth, setTempCalendarMonth] = useState(8);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as Record<
            string,
            NotificationItem[]
          >;
          if (parsed && typeof parsed === "object") {
            setNotifications(parsed);
          }
        }
      } catch (error) {
        console.warn("Erro ao carregar notificações salvas:", error);
      }
    };

    loadNotifications();
  }, []);

  useEffect(() => {
    const saveNotifications = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
      } catch (error) {
        console.warn("Erro ao salvar notificações:", error);
      }
    };

    saveNotifications();
  }, [notifications]);

  // Animação do círculo girando
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (modalStep === "loading") {
      spinValue.setValue(0);
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ).start();

      const timer = setTimeout(() => {
        setModalStep("success");
      }, 2000);

      return () => clearTimeout(timer);
    }

    if (modalStep === "success") {
      const timer = setTimeout(() => {
        setModalStep("options");
      }, 1800);

      return () => clearTimeout(timer);
    }
  }, [modalStep]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const year = 2026;

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const totalDays = getDaysInMonth(currentMonthIndex, year);
  const startDayOfWeek = getFirstDayOfMonth(currentMonthIndex, year);

  const prevMonthIndex = currentMonthIndex === 0 ? 11 : currentMonthIndex - 1;
  const nextMonthIndex = currentMonthIndex === 11 ? 0 : currentMonthIndex + 1;
  const prevMonthDays = getDaysInMonth(
    prevMonthIndex,
    currentMonthIndex === 0 ? year - 1 : year,
  );

  const daysArray = [];

  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const dayNum = prevMonthDays - i;
    const holidayKey = `${prevMonthIndex}-${dayNum}`;
    daysArray.push({
      day: dayNum,
      monthIndex: prevMonthIndex,
      isCurrentMonth: false,
      holidayName: HOLIDAYS_2026[holidayKey],
    });
  }

  for (let d = 1; d <= totalDays; d++) {
    const holidayKey = `${currentMonthIndex}-${d}`;
    daysArray.push({
      day: d,
      monthIndex: currentMonthIndex,
      isCurrentMonth: true,
      holidayName: HOLIDAYS_2026[holidayKey],
    });
  }

  const remainingCells = 7 - (daysArray.length % 7);
  if (remainingCells < 7) {
    for (let d = 1; d <= remainingCells; d++) {
      const holidayKey = `${nextMonthIndex}-${d}`;
      daysArray.push({
        day: d,
        monthIndex: nextMonthIndex,
        isCurrentMonth: false,
        holidayName: HOLIDAYS_2026[holidayKey],
      });
    }
  }

  const handlePrevMonth = () => {
    if (currentMonthIndex > 0) {
      setCurrentMonthIndex(currentMonthIndex - 1);
      setSelectedDay(1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonthIndex < 11) {
      setCurrentMonthIndex(currentMonthIndex + 1);
      setSelectedDay(1);
    }
  };

  const handleSelectDay = (item: {
    day: number;
    monthIndex: number;
    isCurrentMonth: boolean;
  }) => {
    if (!item.isCurrentMonth) {
      setCurrentMonthIndex(item.monthIndex);
    }
    setSelectedDay(item.day);
  };

  const selectedHolidayKey = `${currentMonthIndex}-${selectedDay}`;
  const currentSelectedHoliday = HOLIDAYS_2026[selectedHolidayKey];

  const handleOpenModal = () => {
    setModalStep("confirm");
    setPickerMode(null);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setModalStep("confirm");
    setPickerMode(null);
  };

  const getNotificationDateKey = (
    day: number,
    monthIndex: number,
    year: number,
  ) => `${year}-${monthIndex}-${day}`;

  const formatNotifDateString = () => {
    const dateObj = new Date(
      notifDate.year,
      notifDate.monthIndex,
      notifDate.day,
    );
    const weekDayIndex = dateObj.getDay();
    const wName = WEEK_DAYS_SHORT[weekDayIndex];
    const mName = MONTHS_SHORT[notifDate.monthIndex];
    return `${wName}, ${notifDate.day} de ${mName}`;
  };

  const getHolidayNameForDate = (day: number, monthIndex: number) => {
    return HOLIDAYS_2026[`${monthIndex}-${day}`] ?? "Evento da Agenda";
  };

  const selectedDateKey = getNotificationDateKey(
    selectedDay,
    currentMonthIndex,
    year,
  );

  const currentDateNotifications = notifications[selectedDateKey] ?? [];

  const handleSaveNotification = () => {
    const dateKey = getNotificationDateKey(
      notifDate.day,
      notifDate.monthIndex,
      notifDate.year,
    );

    const timestamp = new Date(
      notifDate.year,
      notifDate.monthIndex,
      notifDate.day,
      parseInt(notifHour, 10),
      parseInt(notifMinute, 10),
    ).getTime();

    const newNotification: NotificationItem = {
      id: Math.random().toString(),
      title: getHolidayNameForDate(notifDate.day, notifDate.monthIndex),
      day: notifDate.day,
      monthIndex: notifDate.monthIndex,
      year: notifDate.year,
      hour: notifHour,
      minute: notifMinute,
      timestamp,
    };

    setNotifications((prev) => {
      const existing = prev[dateKey] ?? [];
      const updated = [...existing, newNotification].sort(
        (a, b) => a.timestamp - b.timestamp,
      );

      return {
        ...prev,
        [dateKey]: updated,
      };
    });

    setModalStep("loading");
  };

  const handleRemoveNotification = (id: string) => {
    setNotifications((prev) => {
      const next = { ...prev };

      Object.keys(next).forEach((dateKey) => {
        next[dateKey] = next[dateKey].filter((item) => item.id !== id);
        if (next[dateKey].length === 0) {
          delete next[dateKey];
        }
      });

      return next;
    });
  };

  const baseHours = Array.from({ length: 24 }, (_, i) =>
    String(i).padStart(2, "0"),
  );
  const infiniteHours = Array(50).fill(baseHours).flat();

  const baseMinutes = Array.from({ length: 12 }, (_, i) =>
    String(i * 5).padStart(2, "0"),
  );
  const infiniteMinutes = Array(50).fill(baseMinutes).flat();

  const hourScrollRef = useRef<ScrollView>(null);
  const minuteScrollRef = useRef<ScrollView>(null);

  const ITEM_HEIGHT = 40;

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace("/");
            }
          }}
        >
          <Ionicons name="chevron-back" size={26} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AGENDA 2026</Text>
        <TouchableOpacity
          style={styles.todayButton}
          onPress={() => {
            setCurrentMonthIndex(8);
            setSelectedDay(16);
          }}
        >
          <Text style={styles.todayButtonText}>Hoje</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Seletor de Meses */}
        <View style={styles.monthSelector}>
          <TouchableOpacity
            onPress={handlePrevMonth}
            disabled={currentMonthIndex === 0}
            style={[
              styles.monthArrowButton,
              currentMonthIndex === 0 && styles.monthArrowButtonDisabled,
            ]}
          >
            <Ionicons
              name="chevron-back"
              size={20}
              color={currentMonthIndex === 0 ? "#4A7067" : "#FFF"}
            />
          </TouchableOpacity>

          <Text style={styles.monthTitle}>
            {MONTHS[currentMonthIndex].toUpperCase()} DE 2026
          </Text>

          <TouchableOpacity
            onPress={handleNextMonth}
            disabled={currentMonthIndex === 11}
            style={[
              styles.monthArrowButton,
              currentMonthIndex === 11 && styles.monthArrowButtonDisabled,
            ]}
          >
            <Ionicons
              name="chevron-forward"
              size={20}
              color={currentMonthIndex === 11 ? "#4A7067" : "#FFF"}
            />
          </TouchableOpacity>
        </View>

        {/* Card Principal do Calendário */}
        <View style={styles.calendarCard}>
          <View style={styles.weekDaysContainer}>
            {WEEK_DAYS.map((day, index) => (
              <Text key={index} style={styles.weekDayText}>
                {day}
              </Text>
            ))}
          </View>

          <View style={styles.calendarGrid}>
            {daysArray.map((item, index) => {
              const isSelected =
                item.isCurrentMonth && item.day === selectedDay;
              const isHoliday = !!item.holidayName;

              return (
                <View key={`day-${index}`} style={styles.dayCellContainer}>
                  <TouchableOpacity
                    style={[
                      styles.dayCell,
                      isSelected && styles.dayCellSelected,
                    ]}
                    onPress={() => handleSelectDay(item)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        !item.isCurrentMonth && styles.dayTextOtherMonth,
                        isSelected && styles.dayTextSelected,
                      ]}
                    >
                      {item.day}
                    </Text>

                    {isHoliday && (
                      <View
                        style={[
                          styles.holidayDot,
                          isSelected && styles.holidayDotSelected,
                        ]}
                      />
                    )}
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </View>

        {/* Resumo da Data Escolhida */}
        <View style={styles.selectedDateCard}>
          <Ionicons name="calendar" size={20} color="#02493D" />
          <View style={{ flex: 1 }}>
            <Text style={styles.selectedDateText}>
              Data selecionada:{" "}
              <Text style={styles.selectedDateBold}>
                {selectedDay} de {MONTHS[currentMonthIndex]} de 2026
              </Text>
            </Text>
            {currentSelectedHoliday && (
              <Text style={styles.holidayBadgeText}>
                🎉 Feriado: {currentSelectedHoliday}
              </Text>
            )}
          </View>

          {currentSelectedHoliday && (
            <TouchableOpacity
              style={styles.bellButton}
              onPress={handleOpenModal}
              activeOpacity={0.7}
            >
              <Ionicons
                name="notifications-outline"
                size={22}
                color="#02493D"
              />
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Modal Popup */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              modalStep === "createNotification" && styles.modalContentLarge,
              modalStep === "manageList" && styles.modalContentLarge,
            ]}
          >
            {modalStep === "confirm" && (
              <>
                <View style={styles.modalIconContainer}>
                  <Ionicons name="notifications" size={26} color="#FFF" />
                </View>
                <Text style={styles.modalTitle}>Notificação de Evento</Text>
                <Text style={styles.modalMessage}>
                  Este botão permite criar uma notificação no dispositivo para
                  este evento, deseja prosseguir com a ação:
                </Text>
                <View style={styles.modalButtonsContainer}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalButtonNo]}
                    onPress={handleCloseModal}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.modalButtonNoText}>Não</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalButtonYes]}
                    onPress={() => setModalStep("options")}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.modalButtonYesText}>Sim</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {modalStep === "options" && (
              <>
                <View style={styles.modalIconContainer}>
                  <Ionicons name="settings-outline" size={26} color="#FFF" />
                </View>
                <Text style={styles.modalTitle}>Gerenciar Notificações</Text>
                <Text style={styles.modalMessage}>
                  Escolha uma das opções abaixo para continuar:
                </Text>
                <View style={styles.modalStackContainer}>
                  <TouchableOpacity
                    style={styles.modalOptionButton}
                    onPress={() => {
                      setNotifDate({
                        day: selectedDay,
                        monthIndex: currentMonthIndex,
                        year: 2026,
                      });
                      setTempCalendarMonth(currentMonthIndex);
                      setNotifHour("00");
                      setNotifMinute("00");
                      setModalStep("createNotification");
                    }}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name="add-circle-outline"
                      size={20}
                      color="#02493D"
                    />
                    <Text style={styles.modalOptionText}>
                      Criar notificação
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.modalOptionButton}
                    onPress={() => setModalStep("manageList")}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="list-outline" size={20} color="#02493D" />
                    <Text style={styles.modalOptionText}>
                      Gerenciar notificações ({currentDateNotifications.length})
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.modalCancelButton}
                    onPress={handleCloseModal}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.modalCancelButtonText}>Fechar</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {modalStep === "manageList" && (
              <View style={{ width: "100%" }}>
                <Text style={styles.modalTitle}>Notificações Salvas</Text>
                <Text style={styles.modalMessage}>
                  Em ordem crescente de data e horário:
                </Text>

                <ScrollView
                  style={{ maxHeight: 220, width: "100%", marginBottom: 16 }}
                >
                  {currentDateNotifications.length === 0 ? (
                    <Text
                      style={{
                        textAlign: "center",
                        color: "#9CA3AF",
                        paddingVertical: 20,
                      }}
                    >
                      Nenhuma notificação cadastrada para esta data.
                    </Text>
                  ) : (
                    currentDateNotifications.map((item) => (
                      <View key={item.id} style={styles.notificationCardItem}>
                        <View style={styles.notifItemContent}>
                          <Ionicons
                            name="notifications"
                            size={16}
                            color="#25A688"
                          />
                          <View style={{ flex: 1, marginLeft: 8 }}>
                            <Text style={styles.notifItemTitle}>
                              {item.title}
                            </Text>
                            <Text style={styles.notifItemSub}>
                              {item.day} de {MONTHS_SHORT[item.monthIndex]} -{" "}
                              {item.hour}:{item.minute}
                            </Text>
                          </View>
                        </View>

                        <TouchableOpacity
                          style={styles.trashButton}
                          onPress={() => handleRemoveNotification(item.id)}
                          activeOpacity={0.8}
                        >
                          <Ionicons
                            name="trash-outline"
                            size={16}
                            color="#DC2626"
                          />
                        </TouchableOpacity>
                      </View>
                    ))
                  )}
                </ScrollView>

                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    styles.modalButtonYes,
                    { width: "100%" },
                  ]}
                  onPress={() => setModalStep("options")}
                  activeOpacity={0.8}
                >
                  <Text style={styles.modalButtonYesText}>Voltar</Text>
                </TouchableOpacity>
              </View>
            )}

            {modalStep === "loading" && (
              <View style={{ alignItems: "center", paddingVertical: 30 }}>
                <Animated.View
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 25,
                    borderWidth: 4,
                    borderColor: "#E5E7EB",
                    borderTopColor: "#25A688",
                    transform: [{ rotate: spin }],
                    marginBottom: 20,
                  }}
                />
                <Text style={styles.modalTitle}>Salvando notificação...</Text>
              </View>
            )}

            {modalStep === "success" && (
              <View style={{ alignItems: "center", paddingVertical: 20 }}>
                <View
                  style={[
                    styles.modalIconContainer,
                    { backgroundColor: "#10B981" },
                  ]}
                >
                  <Ionicons name="checkmark" size={30} color="#FFF" />
                </View>
                <Text style={styles.modalTitle}>Sucesso!</Text>
                <Text style={styles.modalMessage}>
                  Notificação salva e ordenada com sucesso.
                </Text>
              </View>
            )}

            {modalStep === "createNotification" && (
              <View style={{ width: "100%" }}>
                <Text style={styles.createEventNameTitle}>
                  {currentSelectedHoliday || "Evento da Agenda"}
                </Text>

                <View style={styles.dateTimeBarContainer}>
                  <TouchableOpacity
                    style={[
                      styles.datePillButton,
                      pickerMode === "calendar" && styles.activePill,
                    ]}
                    onPress={() =>
                      setPickerMode(
                        pickerMode === "calendar" ? null : "calendar",
                      )
                    }
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.datePillText,
                        pickerMode === "calendar" && styles.activePillText,
                      ]}
                    >
                      {formatNotifDateString()}
                    </Text>
                  </TouchableOpacity>

                  <Text style={styles.dateBarSeparator}>|</Text>

                  <TouchableOpacity
                    style={[
                      styles.timeButton,
                      pickerMode === "time" && styles.activePill,
                    ]}
                    onPress={() => {
                      const nextMode = pickerMode === "time" ? null : "time";
                      setPickerMode(nextMode);
                      if (nextMode === "time") {
                        setTimeout(() => {
                          const hIndex = baseHours.indexOf(notifHour);
                          const mIndex = baseMinutes.indexOf(notifMinute);
                          const targetH =
                            (25 * 24 + (hIndex >= 0 ? hIndex : 0)) *
                            ITEM_HEIGHT;
                          const targetM =
                            (25 * 12 + (mIndex >= 0 ? mIndex : 0)) *
                            ITEM_HEIGHT;

                          hourScrollRef.current?.scrollTo({
                            y: targetH,
                            animated: false,
                          });
                          minuteScrollRef.current?.scrollTo({
                            y: targetM,
                            animated: false,
                          });
                        }, 50);
                      }
                    }}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.timeButtonText,
                        pickerMode === "time" && styles.activePillText,
                      ]}
                    >
                      {notifHour}:{notifMinute}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Seletor do Calendário */}
                {pickerMode === "calendar" && (
                  <View style={styles.inlineCalendarContainer}>
                    <View style={styles.calHeaderRow}>
                      <TouchableOpacity
                        onPress={() =>
                          setTempCalendarMonth(
                            Math.max(0, tempCalendarMonth - 1),
                          )
                        }
                      >
                        <Ionicons
                          name="chevron-back"
                          size={18}
                          color="#4B5563"
                        />
                      </TouchableOpacity>
                      <Text style={styles.calMonthLabel}>
                        {MONTHS[tempCalendarMonth].toLowerCase()} de 2026
                      </Text>
                      <TouchableOpacity
                        onPress={() =>
                          setTempCalendarMonth(
                            Math.min(11, tempCalendarMonth + 1),
                          )
                        }
                      >
                        <Ionicons
                          name="chevron-forward"
                          size={18}
                          color="#4B5563"
                        />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.calWeekDaysRow}>
                      {WEEK_DAYS.map((wd, i) => (
                        <Text key={i} style={styles.calWeekDayText}>
                          {wd}.
                        </Text>
                      ))}
                    </View>

                    <View style={styles.calGrid}>
                      {(() => {
                        const daysInM = getDaysInMonth(tempCalendarMonth, 2026);
                        const startD = getFirstDayOfMonth(
                          tempCalendarMonth,
                          2026,
                        );
                        const arr = [];
                        const prevM =
                          tempCalendarMonth === 0 ? 11 : tempCalendarMonth - 1;
                        const prevDaysCount = getDaysInMonth(prevM, 2026);
                        for (let i = startD - 1; i >= 0; i--) {
                          arr.push({
                            d: prevDaysCount - i,
                            current: false,
                            mIdx: prevM,
                          });
                        }
                        for (let d = 1; d <= daysInM; d++) {
                          arr.push({
                            d: d,
                            current: true,
                            mIdx: tempCalendarMonth,
                          });
                        }
                        while (arr.length % 7 !== 0) {
                          arr.push({
                            d: arr.length - daysInM - startD + 1,
                            current: false,
                            mIdx:
                              tempCalendarMonth === 11
                                ? 0
                                : tempCalendarMonth + 1,
                          });
                        }

                        return arr.map((item, idx) => {
                          const isSelectedDate =
                            item.current &&
                            item.d === notifDate.day &&
                            item.mIdx === notifDate.monthIndex;

                          return (
                            <TouchableOpacity
                              key={idx}
                              style={[
                                styles.calCell,
                                isSelectedDate && styles.calCellSelected,
                              ]}
                              onPress={() => {
                                setNotifDate({
                                  day: item.d,
                                  monthIndex: item.mIdx,
                                  year: 2026,
                                });
                                setPickerMode(null);
                              }}
                            >
                              <Text
                                style={[
                                  styles.calCellText,
                                  !item.current && styles.calCellOtherMonth,
                                  isSelectedDate && styles.calCellTextSelected,
                                ]}
                              >
                                {item.d}
                              </Text>
                            </TouchableOpacity>
                          );
                        });
                      })()}
                    </View>
                  </View>
                )}

                {/* Seletor de Hora / Minuto com Foco Centralizado */}
                {pickerMode === "time" && (
                  <View style={styles.inlineTimePickerContainer}>
                    <Text style={styles.timePickerInstruction}>
                      Role para definir a hora (00 a 23) e minutos (5 em 5 min)
                    </Text>

                    <View style={styles.timePickersWrapper}>
                      <View
                        style={styles.timeSelectionFocus}
                        pointerEvents="none"
                      />

                      <View style={styles.timePickersRow}>
                        <ScrollView
                          ref={hourScrollRef}
                          style={styles.timeColumnScroll}
                          showsVerticalScrollIndicator={false}
                          contentContainerStyle={{
                            alignItems: "center",
                            paddingVertical: 40,
                          }}
                          onLayout={() => {
                            const hIndex = baseHours.indexOf(notifHour);
                            const targetH =
                              (25 * 24 + (hIndex >= 0 ? hIndex : 0)) *
                              ITEM_HEIGHT;
                            hourScrollRef.current?.scrollTo({
                              y: targetH,
                              animated: false,
                            });
                          }}
                          onMomentumScrollEnd={(e) => {
                            const y = e.nativeEvent.contentOffset.y;
                            const index = Math.round(y / ITEM_HEIGHT);
                            const normalizedIndex = index % 24;
                            if (normalizedIndex >= 0 && normalizedIndex < 24) {
                              setNotifHour(baseHours[normalizedIndex]);
                            }
                          }}
                        >
                          {infiniteHours.map((h, index) => {
                            const isSel = h === notifHour;
                            return (
                              <TouchableOpacity
                                key={`h-${index}`}
                                onPress={() => {
                                  setNotifHour(h);
                                  const hIndex = baseHours.indexOf(h);
                                  const targetH =
                                    (25 * 24 + hIndex) * ITEM_HEIGHT;
                                  hourScrollRef.current?.scrollTo({
                                    y: targetH,
                                    animated: true,
                                  });
                                }}
                                style={styles.timeItemOption}
                              >
                                <Text
                                  style={[
                                    styles.timeItemText,
                                    isSel && styles.timeItemTextSelected,
                                  ]}
                                >
                                  {h}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                        </ScrollView>

                        <Text style={styles.timePickerColon}>:</Text>

                        <ScrollView
                          ref={minuteScrollRef}
                          style={styles.timeColumnScroll}
                          showsVerticalScrollIndicator={false}
                          contentContainerStyle={{
                            alignItems: "center",
                            paddingVertical: 40,
                          }}
                          onLayout={() => {
                            const mIndex = baseMinutes.indexOf(notifMinute);
                            const targetM =
                              (25 * 12 + (mIndex >= 0 ? mIndex : 0)) *
                              ITEM_HEIGHT;
                            minuteScrollRef.current?.scrollTo({
                              y: targetM,
                              animated: false,
                            });
                          }}
                          onMomentumScrollEnd={(e) => {
                            const y = e.nativeEvent.contentOffset.y;
                            const index = Math.round(y / ITEM_HEIGHT);
                            const normalizedIndex = index % 12;
                            if (normalizedIndex >= 0 && normalizedIndex < 12) {
                              setNotifMinute(baseMinutes[normalizedIndex]);
                            }
                          }}
                        >
                          {infiniteMinutes.map((m, index) => {
                            const isSel = m === notifMinute;
                            return (
                              <TouchableOpacity
                                key={`m-${index}`}
                                onPress={() => {
                                  setNotifMinute(m);
                                  const mIndex = baseMinutes.indexOf(m);
                                  const targetM =
                                    (25 * 12 + mIndex) * ITEM_HEIGHT;
                                  minuteScrollRef.current?.scrollTo({
                                    y: targetM,
                                    animated: true,
                                  });
                                }}
                                style={styles.timeItemOption}
                              >
                                <Text
                                  style={[
                                    styles.timeItemText,
                                    isSel && styles.timeItemTextSelected,
                                  ]}
                                >
                                  {m}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                        </ScrollView>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={styles.timeConfirmButton}
                      onPress={() => setPickerMode(null)}
                    >
                      <Text style={styles.timeConfirmButtonText}>
                        Confirmar Horário
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {pickerMode === null && (
                  <View
                    style={[styles.modalButtonsContainer, { marginTop: 20 }]}
                  >
                    <TouchableOpacity
                      style={[styles.modalButton, styles.modalButtonNo]}
                      onPress={() => setModalStep("options")}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.modalButtonNoText}>Cancelar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.modalButton, styles.modalButtonYes]}
                      onPress={handleSaveNotification}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.modalButtonYesText}>Salvar</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#02493D",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFF",
    letterSpacing: 0.5,
  },
  todayButton: {
    backgroundColor: "#25A688",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  todayButtonText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 12,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  monthSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 16,
  },
  monthArrowButton: {
    backgroundColor: "#25A688",
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  monthArrowButtonDisabled: {
    backgroundColor: "transparent",
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFF",
    letterSpacing: 1.2,
  },
  calendarCard: {
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  weekDaysContainer: {
    flexDirection: "row",
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
    paddingBottom: 10,
  },
  weekDayText: {
    flex: 1,
    color: "#8FA8A3",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCellContainer: {
    width: "14.28%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  dayCell: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    position: "relative",
  },
  dayCellSelected: {
    backgroundColor: "#FFF",
    elevation: 5,
  },
  dayText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "500",
  },
  dayTextOtherMonth: {
    color: "#4A7067",
    fontWeight: "400",
  },
  dayTextSelected: {
    fontWeight: "700",
    color: "#02493D",
  },
  holidayDot: {
    position: "absolute",
    bottom: 3,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#FFF",
  },
  holidayDotSelected: {
    backgroundColor: "#02493D",
  },
  selectedDateCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 16,
    marginTop: 20,
    gap: 12,
    elevation: 4,
  },
  selectedDateText: {
    color: "#4B5563",
    fontSize: 14,
  },
  selectedDateBold: {
    color: "#02493D",
    fontWeight: "700",
  },
  holidayBadgeText: {
    color: "#0D9488",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 4,
  },
  bellButton: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderRadius: 24,
    padding: 24,
    width: "100%",
    maxWidth: 340,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalContentLarge: {
    maxWidth: 380,
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  modalIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#25A688",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#02493D",
    marginBottom: 10,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 14,
    color: "#4B5563",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  modalButtonsContainer: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  modalButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  modalButtonNo: {
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  modalButtonNoText: {
    color: "#4B5563",
    fontSize: 16,
    fontWeight: "700",
  },
  modalButtonYes: {
    backgroundColor: "#25A688",
  },
  modalButtonYesText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    includeFontPadding: false,
  },
  modalStackContainer: {
    width: "100%",
    gap: 10,
  },
  modalOptionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  modalOptionText: {
    color: "#02493D",
    fontSize: 15,
    fontWeight: "600",
  },
  modalCancelButton: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 4,
  },
  modalCancelButtonText: {
    color: "#4B5563",
    fontSize: 15,
    fontWeight: "600",
  },
  notificationCardItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  notifItemContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  notifItemTitle: {
    color: "#02493D",
    fontSize: 13,
    fontWeight: "700",
  },
  notifItemSub: {
    color: "#4B5563",
    fontSize: 11,
  },
  trashButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  createEventNameTitle: {
    color: "#02493D",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 16,
  },
  dateTimeBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 30,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  datePillButton: {
    backgroundColor: "#E5E7EB",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  activePill: {
    backgroundColor: "#25A688",
  },
  activePillText: {
    color: "#FFF",
  },
  datePillText: {
    color: "#374151",
    fontSize: 13,
    fontWeight: "600",
  },
  dateBarSeparator: {
    color: "#9CA3AF",
    fontSize: 16,
    fontWeight: "400",
  },
  timeButton: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  timeButtonText: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "600",
  },
  inlineCalendarContainer: {
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 12,
    width: "100%",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  calHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  calMonthLabel: {
    color: "#02493D",
    fontSize: 14,
    fontWeight: "700",
  },
  calWeekDaysRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  calWeekDayText: {
    flex: 1,
    color: "#EF4444",
    fontSize: 10,
    fontWeight: "700",
    textAlign: "center",
  },
  calGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  calCell: {
    width: "14.28%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 2,
  },
  calCellSelected: {
    backgroundColor: "#25A688",
    borderRadius: 18,
  },
  calCellText: {
    color: "#374151",
    fontSize: 13,
  },
  calCellOtherMonth: {
    color: "#9CA3AF",
  },
  calCellTextSelected: {
    color: "#FFF",
    fontWeight: "700",
  },
  inlineTimePickerContainer: {
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 16,
    width: "100%",
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  timePickerInstruction: {
    color: "#6B7280",
    fontSize: 11,
    textAlign: "center",
    marginBottom: 12,
  },
  timePickersWrapper: {
    position: "relative",
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  timeSelectionFocus: {
    position: "absolute",
    top: 40,
    height: 40,
    left: 20,
    right: 20,
    backgroundColor: "#FFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  timePickersRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 120,
    gap: 16,
    zIndex: 1,
  },
  timeColumnScroll: {
    width: 60,
    height: 120,
  },
  timePickerColon: {
    color: "#02493D",
    fontSize: 20,
    fontWeight: "700",
    zIndex: 2,
  },
  timeItemOption: {
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  timeItemText: {
    color: "#9CA3AF",
    fontSize: 18,
    fontWeight: "500",
  },
  timeItemTextSelected: {
    color: "#02493D",
    fontSize: 22,
    fontWeight: "700",
  },
  timeConfirmButton: {
    marginTop: 12,
    backgroundColor: "#25A688",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  timeConfirmButtonText: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "700",
  },
});
