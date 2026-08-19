import { StyleSheet } from "react-native";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

const whiteColor = '#efededf3'

const styles = StyleSheet.create({

    container: {
        flex: 1,
    },

    header: {
        justifyContent: 'space-between',
        flexDirection: 'row',
        backgroundColor: '#a5a5a548',
        borderBottomColor: '#e5e3e3ff',
        borderBottomWidth: wp('0.2'),

    },

    headerText: {
        color: whiteColor,
        fontSize: hp('3.5'),
        paddingTop: hp('7'),
        paddingBottom: hp('2'),
        fontWeight: '600',
    },

    headerIcon: {
        fontSize: hp('3.5'),
        marginLeft: wp('4'),
        paddingTop: hp('7'),
        paddingBottom: hp('2'),
    },

    Title: {
        color: '#eaeaeaff',
        fontSize: hp('5%'),
        textAlign: 'center',
        marginTop: hp('11.9%'),
        fontWeight: '700',

    },

    MiniTitle: {
        color: '#eaeaeaff',
        fontSize: hp('2.1'),
        textAlign: "center",
        marginTop: hp('1.2%'),
        fontWeight: 500
    },


    FormContainer: {
        backgroundColor: '#e9e9e939',
        paddingVertical: hp('1%'),
        marginTop: hp('3%'),
        marginBottom: hp('1.2%'),
        marginHorizontal: wp('2.5%'),
        borderRadius: 15,
        borderColor: '#e1e1e1ff',
        borderStyle: 'solid',
        borderWidth: 0.5,
    },

    FormContainerText: {
        color: whiteColor,
        textAlign: 'center',
        fontWeight: 600,
        paddingVertical: hp('0.6%'),
        paddingHorizontal: hp('0.6%'),
        fontSize: hp('2.2')
    },


    RoleBtnContainer: {

        flexDirection: "row",
        justifyContent: 'center',
        alignSelf: 'center',
        maxWidth: wp('90%'),
        borderRadius: 20,
        borderColor: whiteColor,
        borderStyle: 'solid',
        borderWidth: 0.5,
        overflow: 'hidden',
        marginBottom: hp('0.7%'),
        backgroundColor: whiteColor,

    },

    RoleBtn: {
        flexDirection: 'row',
        backgroundColor: whiteColor,
        textAlign: 'center',
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: wp('5%'),
        paddingVertical: hp('0.9%'),
        borderRadius: 20,
        width: wp('30%')
    },

    roleSelectIcon: {
        alignSelf: 'center',
        marginVertical: hp('0.55%'),
        marginHorizontal: wp('1.3%'),
    },

    RoleBG: {
        //  backgroundColor:'#2da0ecff',
        marginVertical: hp('1.1%'),
        marginHorizontal: wp('2.3%'),
        borderRadius: 10,
        borderColor: '#e1e1e1ff',
        borderStyle: 'solid',
        borderWidth: 0.5,
        paddingVertical: hp('2%'),
        paddingHorizontal: wp('4%')
    },

    RoleText: {
        color: whiteColor,
        textAlign: 'center',
        fontWeight: 600,
        paddingVertical: hp('0.6%'),
        paddingHorizontal: hp('0.6%'),
    },

    AuthInput: {
        backgroundColor: whiteColor,
        paddingVertical: hp('1.25%'),
        paddingHorizontal: wp('3%'),
        marginVertical: hp('1.25%'),
        marginHorizontal: wp('2.5%'),
        borderRadius: 10,
        fontSize: hp('2.4%'),
        color: 'black',
    },

    Button: {
        backgroundColor: whiteColor,
        paddingVertical: hp('1.9'),
        paddingHorizontal: wp('14%'),
        borderRadius: wp('5%'),
        alignItems: 'center',
        alignSelf: 'center',
        marginTop: hp('1.4%'),
    },

    themeButton: {
        marginVertical: hp('2.1%'),
        marginHorizontal: wp('2.5%'),
        width: wp('14%'),
        height: hp('6.5%'),
        borderRadius: 100,
        borderColor: 'gray',
        borderWidth: wp(0.128),
    },

    insightsButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: wp('45'),
        height: hp('10'),
        marginHorizontal: wp('2.5'),
        marginTop: hp('1.5'),
        borderRadius: wp('5'),
        borderColor: '#dededeaf',
        borderWidth: 1,
    },

    insightsButtonText: {
        fontSize: hp('2.5'),
        textAlign: 'left',
        color: '#fcf6f6ff',
        marginLeft: wp('5'),
    },

    insightsButtonIcon: {
        marginRight: wp('4'),
    },
    flatlistContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'stretch',
        backgroundColor: '#f3f2f253',
        marginHorizontal: wp('2.5'),
        marginVertical: hp('1'),
        paddingVertical: hp('1'),
        paddingHorizontal: wp('2'),
        borderRadius: wp('5'),
        borderWidth: 1,
        borderColor: '#c2c1c1ff',
    },

    leftContainer: {
        flex: 1,
        paddingRight: wp(2),
    },

    rightContainer: {
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },



    flatlistButton: {
        backgroundColor: whiteColor,
        width: wp(30),
        maxWidth: wp(30),
        paddingVertical: hp('1.5'),
        // paddingHorizontal: wp('5'),
        borderRadius: wp('3'),
        alignItems: 'center',

    },

    flatlistTextTitle: {
        fontSize: hp(2.7),
        fontWeight: 600,
        flex: 1
    },

    flatlistText: {
        color: whiteColor,
        marginVertical: hp(1),
        fontWeight: 500,
        fontSize: hp(1.8)

    },
    flatlistText2: {
        borderRadius: wp('5'),
        borderWidth: 1,
        borderColor: '#c2c1c153',
        color: '#333',
        fontWeight: '700',
        fontSize: hp('1.9'),
        textAlign: 'center',
        maxWidth: wp(30),
        paddingHorizontal: wp(1),
        paddingVertical: hp(1),
    },
    viewAll: {
        textAlign: 'center',
        color: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: whiteColor,
        fontSize: hp(1.7),
        fontWeight: 600,

    },

    quickActionsButton: {
        backgroundColor: whiteColor,
        marginVertical: hp('1.4%'),
        width: wp(40),
        height: hp(13),
        maxWidth: wp(45),
        maxHeight: hp(20),
        marginHorizontal: wp('2.5'),
        borderRadius: wp('5%'),
        alignItems: 'center',
    },

    quickActionsIcon: {
        fontSize: hp('3.5'),
        marginTop: hp(2.4),
        marginBottom: hp(0.7),

    },

    headerButton: {
        backgroundColor: '#007B8F',
        paddingVertical: hp('1.9'),
        paddingHorizontal: wp('9'),
        borderRadius: wp('3'),
        alignItems: 'center',
        alignSelf: 'center',
        marginTop: hp('5'),
        fontSize: hp(1.8),
        fontWeight: 800,
        color: whiteColor
    },

    addedQuestionsFlatlistContainer: {
        backgroundColor: '#f3f2f253',
        marginHorizontal: wp('4'),
        marginVertical: hp('1'),
        paddingVertical: hp('1'),
        paddingHorizontal: wp('2'),
        borderRadius: wp('5'),
        borderWidth: '1',
        borderColor: '#c2c1c1ff',
    },

    addedQuestionsFlatlistQuestion: {
        color: '#efededff',
        marginVertical: hp(1),
        fontWeight: 600,
        fontSize: hp(2),
        textAlign: 'center'
    },

    choicesButton: {
        backgroundColor: '#ffffffe9',
        marginVertical: hp('1.1%'),
        minHeight: hp(5),
        height: 'auto',
        minWidth: wp(85),
        marginHorizontal: wp('2.5'),
        paddingVertical: hp(1),
        borderRadius: wp('3.5%'),
        alignItems: 'center',
        justifyContent: 'center',

    },

    choicesButtonText: {
        fontSize: hp(1.8),
        textAlign: 'center',
        fontWeight: 500
    },


    removeIcon: {
        paddingVertical: hp(0.5),
    },

    addQuestionButton: {
        backgroundColor: whiteColor,
        paddingVertical: hp('1'),
        paddingHorizontal: wp('5%'),
        borderRadius: wp('5%'),
        alignItems: 'center',
        alignSelf: 'center',
        marginVertical: hp('1%'),
    },










    questionCard: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginTop: hp('4%'),
        marginBottom: hp('3%'),
        paddingVertical: hp('3%'),
        paddingHorizontal: wp('5%'),
        borderRadius: 20,
        borderColor: 'rgba(255,255,255,0.2)',
        borderWidth: 1,
        minHeight: hp('20%'),
        justifyContent: 'center',
        alignItems: 'center',
    },
    questionLabel: {
        color: '#ccc',
        fontSize: hp('1.8%'),
        marginBottom: hp('1%'),
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    questionText: {
        color: whiteColor,
        fontSize: hp('2.8%'),
        fontWeight: '600',
        textAlign: 'center',
        lineHeight: hp('3.8%'),
    },
    choicesContainer: {
        marginTop: hp('1%'),
    },
    choiceButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.15)',
        marginVertical: hp('1%'),
        paddingVertical: hp('2%'),
        paddingHorizontal: wp('5%'),
        borderRadius: 15,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    choiceCircle: {
        height: wp('8%'),
        width: wp('8%'),
        borderRadius: wp('4%'),
        backgroundColor: 'rgba(0,0,0,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: wp('4%'),
    },
    choiceLetter: {
        color: whiteColor,
        fontWeight: '700',
        fontSize: hp('1.8%'),
    },
    choiceText: {
        color: whiteColor,
        fontSize: hp('2.1%'),
        fontWeight: '500',
        flex: 1, // Ensures text wraps if too long
    },
    footerButton: {
        backgroundColor: whiteColor,
        marginTop: hp('5%'),
        paddingVertical: hp('1.8%'),
        borderRadius: wp('3%'),
        alignItems: 'center',
        alignSelf: 'center',
        width: wp('50%'),
    },
    footerButtonText: {
        fontSize: hp('2%'),
        fontWeight: '700',
        color: '#333',
    },
    infoText: {
        color: whiteColor,
        textAlign: 'center',
        fontSize: hp('2%'),
        marginBottom: hp('2%'),
    },


statBoxStyle :{
  width: '48%',
  backgroundColor: '#f5f5f5',
  paddingVertical: hp('2%'),
  paddingHorizontal: wp('3%'),
  borderRadius: 14,
  marginBottom: hp('1.5%'),
  alignItems: 'center',
},

statLabel :{
  fontSize: hp('1.7%'),
  color: '#555',
  marginTop: hp('0.5%'),
},

statValue :{
  fontSize: hp('2%'),
  fontWeight: '700',
  color: '#333',
  marginTop: hp('0.3%'),
},

    

})

export default styles;