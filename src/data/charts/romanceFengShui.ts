// src/data/charts/romanceFengShui.ts

export interface FengShuiDetail {
  element: string;
  directions: string[];
  colors: string[];
  items: string;
  zodiacs: string;
  sideDesc: string;
}

export interface DayMasterFengShuiProfile {
  name: string;
  genderGuide: {
    男: FengShuiDetail;
    女: FengShuiDetail;
  };
}

export const DAY_MASTER_FENG_SHUI: Record<string, DayMasterFengShuiProfile> = {
  金: {
    name: "金命人",
    genderGuide: {
      男: {
        element: "木（財）",
        directions: ["正東方", "東北方", "東南方"],
        colors: ["綠色", "藍綠色"],
        items: "綠植（萬年青、竹子）、綠水晶、翡翠、綠色瓶身香氛/香水",
        zodiacs: "豬、兔、羊、虎、龍（選擇木製材質）",
        sideDesc: "躺在床上的「右側床邊櫃」擺放鮮花，枯萎即換。"
      },
      女: {
        element: "火（官殺）",
        directions: ["正南方", "西南方", "東南方"],
        colors: ["紅色", "黃色", "粉色", "橘色", "暖色系"],
        items: "紅花、紫花、紅色系香氛蠟燭、燈具、粉色系床單、枕頭套",
        zodiacs: "馬、虎、狗、羊、蛇（選擇陶瓷材質，以紅、橘、黃色為主）",
        sideDesc: "躺在床上的「左側床邊櫃」擺放鮮花，枯萎即換。"
      }
    }
  },
  木: {
    name: "木命人",
    genderGuide: {
      男: {
        element: "土（財）",
        directions: ["東北方", "西北方", "西南方", "東南方", "正南方"],
        colors: ["紅色", "橘色", "黃色", "土黃色"],
        items: "黃土色系天然玉石、陶瓷器皿、紅色燈具、紅/橘色地毯、紅/紫色鮮花與香氛",
        zodiacs: "牛、龍、蛇、馬、羊、狗（選擇陶瓷、玉石材質或同色系生肖布偶）",
        sideDesc: "躺在床上的「右側床邊櫃」擺放鮮花，枯萎即換。"
      },
      女: {
        element: "金（官殺）",
        directions: ["西北方", "正西方", "西南方", "東北方"],
        colors: ["白色", "灰色", "金色", "銀色"],
        items: "香水百合、金屬鬧鐘/風鈴/音樂盒、金屬底座/白色燈罩之燈具、白色瓶身香氛",
        zodiacs: "牛、蛇、猴、雞（選擇金屬材質）",
        sideDesc: "躺在床上的「左側床邊櫃」擺放鮮花，枯萎即換。"
      }
    }
  },
  水: {
    name: "水命人",
    genderGuide: {
      男: {
        element: "火（財）",
        directions: ["正南方", "東南方", "西南方", "正東方"],
        colors: ["紅色", "黃色", "橘色", "綠色"],
        items: "紅花、紫花、紅色燈具/鹽燈、紅/紫香氛、綠色盆栽、萬年青、竹子",
        zodiacs: "馬、虎、狗、羊、蛇（選擇木製材質或紅、黃、橘色系生肖布偶）",
        sideDesc: "躺在床上的「右側床邊櫃」擺放鮮花，枯萎即換。"
      },
      女: {
        element: "土（官殺）",
        directions: ["東北方", "西北方", "西南方", "東南方", "正南方"],
        colors: ["紅色", "黃色", "橘色", "土黃色"],
        items: "紅/黃/橘/土色系掛畫、紅色燈具/鹽燈、紅/紫香氛、天然玉石、黃土色石頭",
        zodiacs: "馬、狗、羊、蛇、龍、牛（選擇陶瓷、玉石、陶土製材質）",
        sideDesc: "躺在床上的「左側床邊櫃」擺放鮮花，枯萎即換。"
      }
    }
  },
  火: {
    name: "火命人",
    genderGuide: {
      男: {
        element: "金（財）",
        directions: ["西北方", "正西方", "西南方", "東北方"],
        colors: ["白色", "灰色", "金色", "銀色"],
        items: "白色鮮花、金屬音樂盒/錢幣/風鈴、白色地毯、白色香氛、金屬製品",
        zodiacs: "蛇、猴、雞、牛（選擇金屬/銅製材質）",
        sideDesc: "躺在床上的「右側床邊櫃」擺放鮮花，枯萎即換。"
      },
      女: {
        element: "水（官殺）",
        directions: ["正北方", "西北方", "東北方", "正西方"],
        colors: ["藍色", "黑色", "白色", "灰色"],
        items: "藍色/白色鮮花、水缸、玻璃水杯(常換水)、藍/白/灰色地毯、金屬/玻璃/水晶燈具",
        zodiacs: "鼠、豬、龍、雞、牛、猴（選擇金屬、玻璃、水晶製材質或藍色系布偶）",
        sideDesc: "躺在床上的「左側床邊櫃」擺放鮮花，枯萎即換。"
      }
    }
  },
  土: {
    name: "土命人",
    genderGuide: {
      男: {
        element: "水（財）",
        directions: ["正北方", "西北方", "東北方", "正西方"],
        colors: ["藍色", "藍綠色", "黑色", "白色", "金色"],
        items: "水缸(不加蓋、水八至九分滿)、藍/白/黑色地毯、白色鮮花、金屬音樂盒/錢幣/風鈴",
        zodiacs: "鼠、豬、龍、雞、牛、猴（選擇金屬、玻璃、水晶製材質）",
        sideDesc: "躺在床上的「右側床邊櫃」擺放鮮花，枯萎即換。"
      },
      女: {
        element: "木（官殺）",
        directions: ["正東方", "東北方", "東南方"],
        colors: ["綠色", "藍綠色"],
        items: "綠植：萬年青、竹子、綠水晶、翡翠、綠色香氛/防蚊植栽",
        zodiacs: "豬、兔、羊、虎、龍（選擇木製材質）",
        sideDesc: "躺在床上的「左側床邊櫃」擺放鮮花，枯萎即換。"
      }
    }
  }
};
