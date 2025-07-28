import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    StyleSheet,
    Dimensions,
    ScrollView,
    Animated,
    PanGestureHandler,
    State,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../styles/ThemeProvider';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

interface CalendarPickerProps {
    isVisible: boolean;
    onClose: () => void;
    onConfirm: (startDate: Date, endDate: Date) => void;
    initialStartDate?: Date;
    initialEndDate?: Date;
}

const { width, height } = Dimensions.get('window');

export default function CalendarPicker({
    isVisible,
    onClose,
    onConfirm,
    initialStartDate,
    initialEndDate
}: CalendarPickerProps) {
    const { theme } = useTheme();
    const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(initialStartDate || null);
    const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(initialEndDate || null);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [modalOpacity] = useState(new Animated.Value(0));
    const [scaleValue] = useState(new Animated.Value(0.8));
    const [slideValue] = useState(new Animated.Value(50));
    const [calendarOpacity] = useState(new Animated.Value(0));
    const [isDragging, setIsDragging] = useState(false);
    const panRef = useRef(null);

    // 모달 애니메이션
    useEffect(() => {
        if (isVisible) {
            Animated.parallel([
                Animated.timing(modalOpacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleValue, {
                    toValue: 1,
                    damping: 25,
                    stiffness: 300,
                    useNativeDriver: true,
                }),
                Animated.spring(slideValue, {
                    toValue: 0,
                    damping: 25,
                    stiffness: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(calendarOpacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(modalOpacity, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(scaleValue, {
                    toValue: 0.8,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(slideValue, {
                    toValue: 50,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(calendarOpacity, {
                    toValue: 0,
                    duration: 150,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [isVisible]);

    // 현재 월의 캘린더 데이터 생성
    const calendarData = useMemo(() => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        const days = [];
        const currentDate = new Date(startDate);

        while (currentDate <= lastDay || days.length < 42) {
            days.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return days;
    }, [currentMonth]);

    // 이전 월로 이동
    const goToPreviousMonth = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setCurrentMonth(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(newDate.getMonth() - 1);
            return newDate;
        });
    };

    // 다음 월로 이동
    const goToNextMonth = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setCurrentMonth(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(newDate.getMonth() + 1);
            return newDate;
        });
    };

    // 날짜 선택 처리
    const handleDateSelect = (date: Date) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
            // 시작일 선택 또는 새로운 범위 시작
            setSelectedStartDate(date);
            setSelectedEndDate(null);
        } else {
            // 종료일 선택 (선택 사항)
            if (date >= selectedStartDate) {
                setSelectedEndDate(date);
            } else {
                // 시작일보다 이전 날짜를 선택한 경우 시작일로 설정
                setSelectedStartDate(date);
                setSelectedEndDate(null);
            }
        }
    };

    // 날짜가 선택 범위에 포함되는지 확인
    const isDateInRange = (date: Date) => {
        if (!selectedStartDate || !selectedEndDate) return false;
        return date >= selectedStartDate && date <= selectedEndDate;
    };

    // 날짜가 시작일인지 확인
    const isStartDate = (date: Date) => {
        return selectedStartDate && date.getTime() === selectedStartDate.getTime();
    };

    // 날짜가 종료일인지 확인
    const isEndDate = (date: Date) => {
        return selectedEndDate && date.getTime() === selectedEndDate.getTime();
    };

    // 날짜가 현재 월에 속하는지 확인
    const isCurrentMonth = (date: Date) => {
        return date.getMonth() === currentMonth.getMonth() &&
            date.getFullYear() === currentMonth.getFullYear();
    };

    // 오늘 날짜인지 확인
    const isToday = (date: Date) => {
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    };

    // 주말인지 확인
    const isWeekend = (date: Date) => {
        const day = date.getDay();
        return day === 0 || day === 6;
    };

    // 확인 버튼 처리
    const handleConfirm = () => {
        if (selectedStartDate) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            // 단일 날짜 선택인 경우 시작일과 종료일을 같게 설정
            const endDate = selectedEndDate || selectedStartDate;
            onConfirm(selectedStartDate, endDate);
            onClose();
        }
    };

    // 취소 버튼 처리
    const handleCancel = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelectedStartDate(initialStartDate || null);
        setSelectedEndDate(initialEndDate || null);
        onClose();
    };



    return (
        <Modal
            visible={isVisible}
            transparent
            animationType="none"
            onRequestClose={onClose}
        >
            <GestureHandlerRootView style={{ flex: 1 }}>
                <Animated.View
                    style={[
                        styles.overlay,
                        {
                            backgroundColor: 'rgba(0,0,0,0.7)',
                            opacity: modalOpacity
                        }
                    ]}
                >
                    <Animated.View
                        style={[
                            styles.container,
                            {
                                backgroundColor: theme.surface,
                                transform: [
                                    { scale: scaleValue },
                                    { translateY: slideValue }
                                ]
                            }
                        ]}
                    >
                        {/* 캘린더 헤더 */}
                        <Animated.View style={{ opacity: calendarOpacity }}>
                            <View style={styles.calendarHeader}>
                                <TouchableOpacity
                                    onPress={handleCancel}
                                    style={styles.closeButton}
                                >
                                    <Ionicons name="close" size={20} color={theme.textSecondary} />
                                </TouchableOpacity>
                                <View style={styles.headerTitleContainer}>
                                    <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
                                        날짜 범위 선택
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    onPress={handleConfirm}
                                    disabled={!selectedStartDate}
                                    style={[
                                        styles.confirmButton,
                                        {
                                            backgroundColor: selectedStartDate ? theme.primary : theme.outline,
                                            opacity: selectedStartDate ? 1 : 0.5
                                        }
                                    ]}
                                >
                                    <Text style={[
                                        styles.confirmButtonText,
                                        { color: selectedStartDate ? theme.onPrimary : theme.textSecondary }
                                    ]}>
                                        확인
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </Animated.View>



                        {/* 월 네비게이션 */}
                        <Animated.View style={[styles.monthNavigation, { opacity: calendarOpacity }]}>
                            <TouchableOpacity
                                onPress={goToPreviousMonth}
                                style={[styles.navButton, { backgroundColor: theme.surfaceVariant }]}
                            >
                                <Ionicons name="chevron-back" size={20} color={theme.textSecondary} />
                            </TouchableOpacity>
                            <View style={styles.monthContainer}>
                                <Text style={[styles.monthText, { color: theme.textPrimary }]}>
                                    {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
                                </Text>
                            </View>
                            <TouchableOpacity
                                onPress={goToNextMonth}
                                style={[styles.navButton, { backgroundColor: theme.surfaceVariant }]}
                            >
                                <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
                            </TouchableOpacity>
                        </Animated.View>

                        {/* 요일 헤더 */}
                        <Animated.View style={[styles.weekHeader, { opacity: calendarOpacity }]}>
                            {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
                                <View key={day} style={styles.weekDayHeader}>
                                    <Text style={[
                                        styles.weekDayText,
                                        {
                                            color: index === 0 ? theme.error :
                                                index === 6 ? theme.primary : theme.textSecondary
                                        }
                                    ]}>
                                        {day}
                                    </Text>
                                </View>
                            ))}
                        </Animated.View>

                        {/* 캘린더 그리드 */}
                        <Animated.ScrollView
                            style={[styles.calendarGrid, { opacity: calendarOpacity }]}
                            showsVerticalScrollIndicator={false}
                        >
                            <View style={styles.calendarContainer}>
                                {calendarData.map((date, index) => {
                                    const isInRange = isDateInRange(date);
                                    const isStart = isStartDate(date);
                                    const isEnd = isEndDate(date);
                                    const isCurrent = isCurrentMonth(date);
                                    const isTodayDate = isToday(date);
                                    const isWeekendDate = isWeekend(date);

                                    return (
                                        <TouchableOpacity
                                            key={index}
                                            style={[
                                                styles.dateCell,
                                                isInRange && !isStart && !isEnd && { backgroundColor: theme.primary + '15' },
                                                isTodayDate && !isStart && !isEnd && {
                                                    borderWidth: 2,
                                                    borderColor: theme.primary
                                                },
                                                isWeekendDate && !isCurrent && { opacity: 0.4 },
                                                !isCurrent && { opacity: 0.3 }
                                            ]}
                                            onPress={() => handleDateSelect(date)}
                                            disabled={!isCurrent}
                                            activeOpacity={0.7}
                                        >
                                            {(isStart || isEnd) ? (
                                                <LinearGradient
                                                    colors={[theme.primary, theme.primary + 'CC', theme.primary + '99']}
                                                    start={{ x: 0, y: 0 }}
                                                    end={{ x: 1, y: 1 }}
                                                    style={[
                                                        styles.glassmorphismDate,
                                                        {
                                                            shadowColor: theme.primary,
                                                            shadowOffset: { width: 0, height: 4 },
                                                            shadowOpacity: 0.3,
                                                            shadowRadius: 8,
                                                            elevation: 8,
                                                        }
                                                    ]}
                                                >
                                                    <BlurView
                                                        intensity={20}
                                                        tint="light"
                                                        style={styles.blurOverlay}
                                                    >
                                                        <Text style={[
                                                            styles.dateText,
                                                            { color: theme.onPrimary, fontWeight: 'bold' }
                                                        ]}>
                                                            {date.getDate()}
                                                        </Text>
                                                        <View style={styles.selectionIndicator}>
                                                            <Ionicons
                                                                name={isStart ? "play" : "checkmark"}
                                                                size={10}
                                                                color={theme.onPrimary}
                                                            />
                                                        </View>
                                                    </BlurView>
                                                </LinearGradient>
                                            ) : (
                                                <>
                                                    <Text style={[
                                                        styles.dateText,
                                                        {
                                                            color: isInRange ? theme.primary :
                                                                isTodayDate ? theme.primary :
                                                                    isWeekendDate ? theme.textSecondary : theme.textPrimary
                                                        }
                                                    ]}>
                                                        {date.getDate()}
                                                    </Text>
                                                    {isTodayDate && !isStart && !isEnd && (
                                                        <View style={[styles.todayIndicator, { backgroundColor: theme.primary }]} />
                                                    )}
                                                </>
                                            )}
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </Animated.ScrollView>
                    </Animated.View>
                </Animated.View>
            </GestureHandlerRootView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    container: {
        width: width - 40,
        maxHeight: height * 0.85,
        borderRadius: 28,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 15 },
        shadowOpacity: 0.4,
        shadowRadius: 25,
        elevation: 15,
    },
    headerTitle: {
        fontSize: 16,
        fontFamily: 'GoogleSans-Bold',
        textAlign: 'center',
    },
    confirmButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 14,
        minWidth: 60,
        alignItems: 'center',
    },
    confirmButtonText: {
        fontSize: 14,
        fontFamily: 'GoogleSans-Medium',
    },

    monthNavigation: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 20,
    },
    navButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    monthContainer: {
        flex: 1,
        alignItems: 'center',
    },
    monthText: {
        fontSize: 20,
        fontFamily: 'GoogleSans-Bold',
    },
    weekHeader: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.08)',
    },
    weekDayHeader: {
        flex: 1,
        alignItems: 'center',
    },
    weekDayText: {
        fontSize: 13,
        fontFamily: 'GoogleSans-Medium',
    },
    calendarGrid: {
        maxHeight: 340,
    },
    calendarContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 24,
        paddingVertical: 20,
    },
    dateCell: {
        width: (width - 88) / 7,
        height: (width - 88) / 7,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: (width - 88) / 14,
        marginVertical: 2,
        position: 'relative',
    },
    dateText: {
        fontSize: 15,
        fontFamily: 'GoogleSans-Medium',
    },
    todayIndicator: {
        position: 'absolute',
        bottom: 4,
        width: 4,
        height: 4,
        borderRadius: 2,
    },
    selectionIndicator: {
        position: 'absolute',
        top: 2,
        right: 2,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: 'rgba(255,255,255,0.3)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    calendarHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.08)',
    },
    closeButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    headerTitleContainer: {
        flex: 1,
        alignItems: 'center',
    },
    glassmorphismDate: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: (width - 88) / 14,
        overflow: 'hidden',
    },
    blurOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
}); 