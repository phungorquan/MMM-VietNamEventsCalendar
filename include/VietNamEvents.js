// Solar date
var DLObj = [
    [{
        evDate: "01",
        evMonth: "01",
        evTitle: "Tết Dương lịch"
    }, {
        evDate: "09",
        evMonth: "01",
        evTitle: "Ngày Sinh viên Học sinh VN"
    }],
    [{
        evDate: "03",
        evMonth: "02",
        evTitle: "Ngày thành lập ĐCSVN"
    }, {
        evDate: "14",
        evMonth: "02",
        evTitle: "Ngày Lễ tình nhân Valentine"
    }, {
        evDate: "27",
        evMonth: "02",
        evTitle: "Ngày Thầy thuốc VN"
    }],
    [{
        evDate: "08",
        evMonth: "03",
        evTitle: "Quốc tế Phụ Nữ"
    }, {
        evDate: "20",
        evMonth: "03",
        evTitle: "Quốc tế Hạnh phúc"
    }, {
        evDate: "26",
        evMonth: "03",
        evTitle: "Ngày thành lập ĐTNCS HCM"
    }, {
        evDate: "27",
        evMonth: "03",
        evTitle: "Ngày Thể thao VN"
    }],
    [{
        evDate: "01",
        evMonth: "04",
        evTitle: "Ngày Cá tháng Tư"
    }, {
        evDate: "21",
        evMonth: "04",
        evTitle: "Ngày Sách VN"
    }, {
        evDate: "22",
        evMonth: "04",
        evTitle: "Ngày Trái đất"
    }, {
        evDate: "30",
        evMonth: "04",
        evTitle: "Ngày thống nhất đất nước"
    }],
    [{
        evDate: "01",
        evMonth: "05",
        evTitle: "Quốc tế Lao Động"
    }, {
        evDate: "07",
        evMonth: "05",
        evTitle: "Ngày chiến thắng ĐBP"
    }, {
        evDate: "15",
        evMonth: "05",
        evTitle: "Quốc tế Gia đình"
    }, {
        evDate: "15",
        evMonth: "05",
        evTitle: "Ngày thành lập ĐTNTP HCM"
    }, {
        evDate: "19",
        evMonth: "05",
        evTitle: "Ngày sinh Chủ tịch HCM"
    }],
    [{
        evDate: "01",
        evMonth: "06",
        evTitle: "Quốc tế Thiếu Nhi"
    }, {
        evDate: "05",
        evMonth: "06",
        evTitle: "Ngày Môi trường Thế Giới"
    }, {
        evDate: "05",
        evMonth: "06",
        evTitle: "Ngày BH ra đi tìm đường cứu nước"
    }, {
        evDate: "28",
        evMonth: "06",
        evTitle: "Ngày Gia đình VN"
    }],
    [{
        evDate: "11",
        evMonth: "07",
        evTitle: "Ngày Dân số Thế Giới"
    }, {
        evDate: "27",
        evMonth: "07",
        evTitle: "Ngày Thương binh liệt sĩ"
    }],
    [{
        evDate: "19",
        evMonth: "08",
        evTitle: "Ngày CMT8 thành công"
    }],
    [{
        evDate: "02",
        evMonth: "09",
        evTitle: "Quốc Khánh"
    }],
    [{
        evDate: "01",
        evMonth: "10",
        evTitle: "Quốc tế Người cao tuổi"
    }, {
        evDate: "13",
        evMonth: "10",
        evTitle: "Ngày Doanh nhân VN"
    }, {
        evDate: "20",
        evMonth: "10",
        evTitle: "Ngày thành lập Hội Phụ nữ VN"
    }, {
        evDate: "31",
        evMonth: "10",
        evTitle: "Halloween Lễ hội hoá trang"
    }],
    [{
        evDate: "19",
        evMonth: "11",
        evTitle: "Quốc tế Nam giới"
    }, {
        evDate: "20",
        evMonth: "11",
        evTitle: "Ngày Nhà giáo VN"
    }],
    [{
        evDate: "01",
        evMonth: "12",
        evTitle: "Quốc tế phòng chống AIDS"
    }, {
        evDate: "03",
        evMonth: "12",
        evTitle: "Quốc tế người khuyết tật"
    }, {
        evDate: "10",
        evMonth: "12",
        evTitle: "Quốc tế nhân quyền"
    }, {
        evDate: "22",
        evMonth: "12",
        evTitle: "Ngày thành lập QĐND VN"
    }, {
        evDate: "25",
        evMonth: "12",
        evTitle: "Lễ Giáng Sinh"
    }]
];
// Lunar date
var ALObj = [{
    evDate: "23",
    evMonth: "12",
    evTitle: "Tết ông Công ông Táo"
}, {
    evDate: "01",
    evMonth: "01",
    evTitle: "Mùng 1 Tết Nguyên Đán"
}, {
    evData: "02",
    evMonth: "01",
    evTitle: "Mùng 2 Tết Nguyên Đán"
}, {
    evDate: "03",
    evMonth: "01",
    evTitle: "Mùng 3 Tết Nguyên Đán"
}, {
    evDate: "15",
    evMonth: "01",
    evTitle: "Tết Nguyên Tiêu"
}, {
    evDate: "03",
    evMonth: "03",
    evTitle: "Tết Hàn thực"
}, {
    evDate: "10",
    evMonth: "03",
    evTitle: "Giỗ tổ Hùng Vương"
}, {
    evDate: "15",
    evMonth: "04",
    evTitle: "Lễ Phật Đản"
}, {
    evDate: "05",
    evMonth: "05",
    evTitle: "Tết Đoan Ngọ"
}, {
    evDate: "15",
    evMonth: "07",
    evTitle: "Lễ Vu Lan"
}, {
    evDate: "15",
    evMonth: "08",
    evTitle: "Tết Trung thu"
}];
/*************************************/
/********* DEPRECATED ARRAY **********/
/*************************************/
// Solar date
// var DL = [
//     ["01/01-Tết Dương lịch", "09/01-Ngày Sinh viên Học sinh VN"],
//     ["03/02-Ngày thành lập ĐCSVN", "14/02-Ngày Lễ tình nhân Valentine", "27/02-Ngày Thầy thuốc VN"],
//     ["08/03-Quốc tế Phụ Nữ", "20/03-Quốc tế Hạnh phúc", "26/03-Ngày thành lập ĐTNCS HCM", "27/03-Ngày Thể thao VN"],
//     ["01/04-Ngày Cá tháng Tư", "21/04-Ngày Sách VN", "22/04-Ngày Trái đất", "30/04-Ngày thống nhất đất nước"],
//     ["01/05-Quốc tế Lao Động", "07/05-Ngày chiến thắng ĐBP", "15/05-Quốc tế Gia đình", "15/05-Ngày thành lập ĐTNTP HCM", "19/05-Ngày sinh Chủ tịch HCM"],
//     ["01/06-Quốc tế Thiếu Nhi", "05/06-Ngày Môi trường Thế Giới", "05/06-Ngày BH ra đi tìm đường cứu nước", "28/06-Ngày Gia đình VN"],
//     ["11/07-Ngày Dân số Thế Giới", "27/07-Ngày Thương binh liệt sĩ"],
//     ["19/08-Ngày CMT8 thành công"],
//     ["02/09-Quốc Khánh"],
//     ["01/10-Quốc tế Người cao tuổi", "13/10-Ngày Doanh nhân VN", "20/10-Ngày thành lập Hội Phụ nữ VN", "31/10-Halloween Lễ hội hoá trang"],
//     ["19/11-Quốc tế Nam giới", "20/11-Ngày Nhà giáo VN"],
//     ["01/12-Quốc tế phòng chống AIDS", "03/12-Quốc tế người khuyết tật", "10/12-Quốc tế nhân quyền", "22/12-Ngày thành lập QĐND VN", "25/12-Lễ Giáng Sinh"]
// ];
// Lunar date and specialEvents will be added in findSpecialDay()
// var AL = ["23/12-Tết ông Công ông Táo", "01/01-Mùng 1 Tết Nguyên Đán", "02/01-Mùng 2 Tết Nguyên Đán", "03/01-Mùng 3 Tết Nguyên Đán", "15/01-Tết Nguyên Tiêu", "03/03-Tết Hàn thực", "10/03-Giỗ tổ Hùng Vương", "15/04-Lễ Phật Đản", "05/05-Tết Đoan Ngọ", "15/07-Lễ Vu Lan", "15/08-Tết Trung thu", ];