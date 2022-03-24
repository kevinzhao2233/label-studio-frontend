cp -f build/main.js ../label-studio/label_studio/frontend/dist/lsf/js
cp -f build/main.js.map ../label-studio/label_studio/frontend/dist/lsf/js

cp -f build/main.css ../label-studio/label_studio/frontend/dist/lsf/css
cp -f build/main.css.map ../label-studio/label_studio/frontend/dist/lsf/css


cp -f build/main.js ../AI_DataMark_Platform/label_studio/frontend/dist/lsf/js
cp -f build/main.js.map ../AI_DataMark_Platform/label_studio/frontend/dist/lsf/js

cp -f build/main.css ../AI_DataMark_Platform/label_studio/frontend/dist/lsf/css
cp -f build/main.css.map ../AI_DataMark_Platform/label_studio/frontend/dist/lsf/css

echo '构建成果已复制到 label-studio 和 AI_DataMark_Platform'