import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet
} from "react-native";

import { colors } from "../theme/colors";

const DAY_NAMES = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

/* ───────── HELPERS ───────── */

function isSameDay(a,b){
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function parseDayFromId(id){

  if(!id) return null;

  const parts = id.split("_");

  if(parts.length !== 4) return null;

  const y = Number(parts[1]);
  const m = Number(parts[2]) - 1;
  const d = Number(parts[3]);

  return new Date(y,m,d);

}

/* ───────── DAY COMPONENT ───────── */

function CalDay({ date, isActive, isToday, hasBills, onPress }){

  return (

    <TouchableOpacity
      style={[
        styles.day,
        isActive && styles.dayActive
      ]}
      onPress={()=>onPress(date)}
      activeOpacity={0.75}
    >

      <Text
        style={[
          styles.dayName,
          isActive && styles.textActive
        ]}
      >
        {DAY_NAMES[date.getDay()]}
      </Text>

      <Text
        style={[
          styles.dayNum,
          isToday && !isActive && styles.dayToday,
          isActive && styles.textActive
        ]}
      >
        {date.getDate()}
      </Text>

      {hasBills
        ? <View style={[
            styles.dot,
            isActive && styles.dotActive
          ]}/>
        : <View style={styles.dotPlaceholder}/>
      }

    </TouchableOpacity>

  );

}

/* ───────── MAIN COMPONENT ───────── */

const SalesCalendar = ({
  stats = [],
  selectedDate,
  onSelectDate
}) => {

  const now = new Date();

  const [calMonth,setCalMonth] =
    useState(now.getMonth());

  const [calYear,setCalYear] =
    useState(now.getFullYear());

  /* ───────── DAYS IN MONTH ───────── */

  const daysInMonth = new Date(
    calYear,
    calMonth + 1,
    0
  ).getDate();

  /* ───────── BILL DAYS SET ───────── */

  const billDaySet = useMemo(()=>{

    const set = new Set();

    stats.forEach((s)=>{

      const d = parseDayFromId(s.id);

      if(
        d &&
        d.getMonth() === calMonth &&
        d.getFullYear() === calYear
      ){
        set.add(d.getDate());
      }

    });

    return set;

  },[stats,calMonth,calYear]);

  /* ───────── MONTH NAV ───────── */

  function prevMonth(){

    if(calMonth === 0){
      setCalMonth(11);
      setCalYear(y=>y-1);
    } else {
      setCalMonth(m=>m-1);
    }

  }

  function nextMonth(){

    if(calMonth === 11){
      setCalMonth(0);
      setCalYear(y=>y+1);
    } else {
      setCalMonth(m=>m+1);
    }

  }

  return (

    <View style={styles.section}>

      {/* MONTH HEADER */}

      <View style={styles.monthRow}>

        <Text style={styles.monthLabel}>
          {MONTH_NAMES[calMonth]} {calYear}
        </Text>

        <View style={styles.navRow}>

          <TouchableOpacity
            style={styles.navBtn}
            onPress={prevMonth}
          >
            <Text style={styles.navIcon}>‹</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navBtn}
            onPress={nextMonth}
          >
            <Text style={styles.navIcon}>›</Text>
          </TouchableOpacity>

        </View>

      </View>

      {/* DAY STRIP */}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.dayStrip}
      >

        {Array.from({ length: daysInMonth },(_,i)=>{

          const date = new Date(
            calYear,
            calMonth,
            i + 1
          );

          return (

            <CalDay
              key={i}
              date={date}
              isActive={isSameDay(date,selectedDate)}
              isToday={isSameDay(date,now)}
              hasBills={billDaySet.has(i+1)}
              onPress={onSelectDate}
            />

          );

        })}

      </ScrollView>

    </View>

  );

};

export default SalesCalendar;

/* ───────── STYLES ───────── */

const styles = StyleSheet.create({

  section:{
    paddingHorizontal:16,
    paddingBottom:12
  },

  monthRow:{
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"space-between",
    marginBottom:10
  },

  monthLabel:{
    fontSize:14,
    fontWeight:"700",
    color:colors.textPrimary
  },

  navRow:{
    flexDirection:"row",
    gap:6
  },

  navBtn:{
    width:30,
    height:30,
    borderRadius:10,
    backgroundColor:"#fff",
    borderWidth:1,
    borderColor:colors.borderCard,
    alignItems:"center",
    justifyContent:"center",
    elevation:2
  },

  navIcon:{
    fontSize:18,
    color:colors.textSecondary
  },

  dayStrip:{
    gap:6
  },

  day:{
    width:52,
    backgroundColor:"#fff",
    borderRadius:14,
    borderWidth:1.5,
    borderColor:colors.borderCard,
    alignItems:"center",
    paddingTop:8,
    paddingBottom:10
  },

  dayActive:{
    backgroundColor:colors.primary,
    borderColor:colors.primary
  },

  dayName:{
    fontSize:9,
    fontWeight:"700",
    color:colors.textSecondary,
    marginBottom:5
  },

  dayNum:{
    fontSize:16,
    fontWeight:"700",
    color:colors.textPrimary
  },

  dayToday:{
    color:colors.accent
  },

  textActive:{
    color:"#fff"
  },

  dot:{
    marginTop:5,
    width:4,
    height:4,
    borderRadius:2,
    backgroundColor:colors.accent
  },

  dotActive:{
    backgroundColor:"rgba(245,166,35,0.85)"
  },

  dotPlaceholder:{
    marginTop:5,
    width:4,
    height:4
  }

});